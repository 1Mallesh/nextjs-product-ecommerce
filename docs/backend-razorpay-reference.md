# NestJS Razorpay Backend Reference

## Environment Variables (.env)
```
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=<YOUR_SECRET>   # NEVER expose to frontend
DATABASE_URL=postgresql://...
```

---

## payment.service.ts
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

const COMMISSION_RATE = 0.10;
const GST_RATE = 0.18;
const DELIVERY_BOY_SHARE = 0.60;
const RAZORPAY_RATE = 0.02;

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  /** Called when customer initiates Razorpay checkout */
  async createRazorpayOrder(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    });

    // amount in paise
    const amountPaise = Math.round(order.total * 100);

    const rzpOrder = await this.razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return { razorpayOrderId: rzpOrder.id, amount: amountPaise };
  }

  /** Called after Razorpay modal success — verify signature & settle */
  async verifyAndSettle(dto: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    // 1. Verify HMAC signature
    const body = dto.razorpay_order_id + '|' + dto.razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expected !== dto.razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: dto.orderId },
      include: { items: true, deliveryBoy: true },
    });

    const productAmount = order.subtotal ?? order.total;
    const deliveryFee = order.deliveryFee ?? 0;
    const platformCommission = Math.round(productAmount * COMMISSION_RATE);
    const gstOnCommission = Math.round(platformCommission * GST_RATE);
    const vendorEarnings = productAmount - platformCommission;
    const deliveryBoyEarnings = Math.round(deliveryFee * DELIVERY_BOY_SHARE);
    const razorpayFee = Math.round((productAmount + deliveryFee) * RAZORPAY_RATE);
    const netPlatformProfit = platformCommission - deliveryBoyEarnings - razorpayFee;

    // 2. Persist payment transaction & update order
    await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          orderId: order.id,
          razorpayOrderId: dto.razorpay_order_id,
          razorpayPaymentId: dto.razorpay_payment_id,
          razorpaySignature: dto.razorpay_signature,
          amount: order.total,
          currency: 'INR',
          status: 'SUCCESS',
          platformCommission,
          gstOnCommission,
          vendorEarnings,
          deliveryBoyEarnings,
          razorpayFee,
          netPlatformProfit,
        },
      }),
      this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      }),
      // Credit vendor wallet
      this.prisma.vendorWallet.upsert({
        where: { vendorId: order.vendorId },
        create: { vendorId: order.vendorId, balance: vendorEarnings, pending: 0 },
        update: { balance: { increment: vendorEarnings } },
      }),
      // Credit delivery boy wallet (if assigned)
      ...(order.deliveryBoyId ? [
        this.prisma.deliveryWallet.upsert({
          where: { deliveryBoyId: order.deliveryBoyId },
          create: { deliveryBoyId: order.deliveryBoyId, balance: deliveryBoyEarnings, pending: 0 },
          update: { balance: { increment: deliveryBoyEarnings } },
        }),
      ] : []),
    ]);

    // 3. Emit real-time events
    this.events.emit('payment.success', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      vendorEarnings,
      deliveryBoyEarnings,
      platformCommission,
    });

    return { success: true };
  }

  /** Retry payment — creates a new Razorpay order for an existing DB order */
  async retryPayment(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    });

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    return this.createRazorpayOrder(orderId);
  }
}
```

---

## payment.controller.ts
```typescript
import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Routes match the frontend payment.service.ts calls exactly:
//   POST /payments/create-order   { orderId }
//   POST /payments/verify         { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
//   GET  /payments/:orderId/status
//   POST /payments/refund         { orderId, amount?, reason? }
//   POST /orders/:id/retry-payment  (from PaymentFailedClient retry)

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private payment: PaymentService) {}

  @Post('create-order')
  createOrder(@Body('orderId') orderId: string) {
    return this.payment.createRazorpayOrder(orderId);
  }

  @Post('verify')
  verify(@Body() body: {
    orderId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return this.payment.verifyAndSettle(body);
  }

  @Get(':orderId/status')
  getStatus(@Param('orderId') orderId: string) {
    return this.payment.getStatus(orderId);
  }

  @Post('refund')
  refund(@Body() body: { orderId: string; amount?: number; reason?: string }) {
    return this.payment.refund(body.orderId, body.amount, body.reason);
  }
}

// Separate controller for retry (order-scoped)
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderPaymentController {
  constructor(private payment: PaymentService) {}

  @Post(':id/retry-payment')
  retry(@Param('id') id: string) {
    return this.payment.retryPayment(id);
  }

  @Post(':id/verify-payment')
  verifyAfterRetry(
    @Param('id') orderId: string,
    @Body() body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  ) {
    return this.payment.verifyAndSettle({ orderId, ...body });
  }
}
```

---

## Razorpay Webhook Handler
```typescript
// payment.webhook.ts
import { Controller, Post, Req, Headers, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Controller('webhooks/razorpay')
export class RazorpayWebhookController {
  constructor(private prisma: PrismaService, private events: EventsGateway) {}

  @Post()
  async handle(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const body = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expected !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const rzpPaymentId = payload.payment.entity.id;
      const rzpOrderId = payload.payment.entity.order_id;

      const order = await this.prisma.order.findFirst({
        where: { razorpayOrderId: rzpOrderId },
      });

      if (order && order.paymentStatus !== 'PAID') {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
        });
        this.events.emit('payment.success', { orderId: order.id, via: 'webhook' });
      }
    }

    if (event === 'payment.failed') {
      const rzpOrderId = payload.payment.entity.order_id;
      const order = await this.prisma.order.findFirst({ where: { razorpayOrderId: rzpOrderId } });
      if (order) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'FAILED' },
        });
        this.events.emit('payment.failed', { orderId: order.id });
      }
    }

    return { received: true };
  }
}
```

---

## Financial Constants (must match frontend)
```
COMMISSION_RATE = 10%   (platform takes 10% of product subtotal)
GST_RATE = 18%          (applied on commission)
DELIVERY_BOY_SHARE = 60% (of delivery fee)
RAZORPAY_RATE = 2%      (Razorpay charges on total)
```

## Prisma Schema additions needed
```prisma
model Payment {
  id                  String   @id @default(cuid())
  orderId             String   @unique
  razorpayOrderId     String
  razorpayPaymentId   String?
  razorpaySignature   String?
  amount              Float
  currency            String   @default("INR")
  status              String   // SUCCESS | FAILED | REFUNDED
  platformCommission  Float    @default(0)
  gstOnCommission     Float    @default(0)
  vendorEarnings      Float    @default(0)
  deliveryBoyEarnings Float    @default(0)
  razorpayFee         Float    @default(0)
  netPlatformProfit   Float    @default(0)
  createdAt           DateTime @default(now())
  order               Order    @relation(fields: [orderId], references: [id])
}

model VendorWallet {
  id        String  @id @default(cuid())
  vendorId  String  @unique
  balance   Float   @default(0)
  pending   Float   @default(0)
}

model DeliveryWallet {
  id            String  @id @default(cuid())
  deliveryBoyId String  @unique
  balance       Float   @default(0)
  pending       Float   @default(0)
}
```
