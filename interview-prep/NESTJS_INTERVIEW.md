# NestJS Interview Questions — Architecture · Prisma · Realtime

---

## 1. Core Architecture

```
NestJS Application
├── AppModule (root)
│   ├── AuthModule
│   │   ├── AuthController  ← HTTP routes
│   │   ├── AuthService     ← Business logic
│   │   ├── AuthGuard       ← Request protection
│   │   └── JwtStrategy     ← Passport strategy
│   ├── OrderModule
│   │   ├── OrderController
│   │   ├── OrderService
│   │   └── PaymentService
│   ├── PrismaModule        ← Database
│   └── EventsModule        ← Socket.IO Gateway
```

---

## 2. Dependency Injection

```typescript
@Module({
  imports: [PrismaModule, JwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [OrderService, PaymentService],
  controllers: [OrderController],
  exports: [OrderService], // make available to other modules
})
export class OrderModule {}

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,  // injected automatically
    private events: EventsGateway,  // injected automatically
    private payment: PaymentService,
  ) {}
}
```

**Q: What is the Inversion of Control (IoC) container?**
NestJS's IoC container manages the lifecycle of all providers. You declare dependencies in constructors — NestJS creates and injects them. Enables testability (swap real services for mocks).

---

## 3. Guards — Authorization

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Custom decorator
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);

// Usage
@Get("admin/orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
getAdminOrders() { ... }
```

---

## 4. Interceptors

```typescript
// Logging interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();
    console.log(`→ ${req.method} ${req.url}`);
    return next.handle().pipe(
      tap(() => console.log(`← ${Date.now() - start}ms`)),
    );
  }
}

// Response transform interceptor (wrap in { data, success })
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(map(data => ({ data, success: true })));
  }
}
```

---

## 5. Pipes — Validation

```typescript
// Global validation pipe (set in main.ts)
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,      // strip unknown properties
  forbidNonWhitelisted: true, // throw on unknown properties
  transform: true,      // auto-transform to DTO types
}));

// DTO with class-validator
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @IsEnum(["RAZORPAY", "COD"])
  paymentMethod: "RAZORPAY" | "COD";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  couponCode?: string;
}
```

---

## 6. Prisma Integration

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// Complex query with relations
async getOrderWithDetails(id: string) {
  return this.prisma.order.findUniqueOrThrow({
    where: { id },
    include: {
      items: {
        include: { product: { select: { name: true, images: true } } }
      },
      address: true,
      customer: { select: { name: true, email: true } },
      payment: true,
    },
  });
}

// Transaction
async settlePayment(orderId: string, earnings: EarningsDto) {
  return this.prisma.$transaction([
    this.prisma.payment.create({ data: { orderId, ...earnings } }),
    this.prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "PAID" } }),
    this.prisma.vendorWallet.upsert({
      where: { vendorId: earnings.vendorId },
      create: { vendorId: earnings.vendorId, balance: earnings.vendorEarnings },
      update: { balance: { increment: earnings.vendorEarnings } },
    }),
  ]);
}
```

---

## 7. Socket.IO Gateway (Realtime)

```typescript
@WebSocketGateway({ namespace: "/tracking", cors: { origin: process.env.FRONTEND_URL } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      client.join(`user:${payload.sub}`); // personal notification room
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage("join-order-room")
  handleJoinOrderRoom(client: Socket, { orderId }: { orderId: string }) {
    client.join(`order:${orderId}`);
  }

  @SubscribeMessage("location-update")
  handleLocationUpdate(client: Socket, data: { latitude: number; longitude: number; orderId?: string }) {
    if (client.data.role !== "DELIVERY_BOY") return;
    if (data.orderId) {
      this.server.to(`order:${data.orderId}`).emit("location-update", data);
    }
  }

  emit(event: string, data: unknown, room?: string) {
    if (room) this.server.to(room).emit(event, data);
    else this.server.emit(event, data);
  }
}
```

---

## 8. Exception Filters

```typescript
@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const errorMap: Record<string, { status: number; message: string }> = {
      P2002: { status: 409, message: "Record already exists (unique constraint)" },
      P2025: { status: 404, message: "Record not found" },
      P2003: { status: 400, message: "Foreign key constraint failed" },
    };
    const mapped = errorMap[exception.code] ?? { status: 500, message: "Database error" };
    res.status(mapped.status).json({ message: mapped.message, code: exception.code });
  }
}
```

---

## 9. Module Structure — TOKOMORT Pattern

```typescript
// Shared module for Prisma
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

// Feature module
@Module({
  imports: [PrismaModule, EventsModule],
  providers: [OrderService, PaymentService],
  controllers: [OrderController, PaymentController],
})
export class OrderModule {}

// App module
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    OrderModule,
    VendorModule,
    DeliveryModule,
    AdminModule,
    EventsModule,
  ],
})
export class AppModule {}
```

---

## 10. Common Interview Questions

**Q: Difference between Middleware, Interceptor, Guard, Pipe?**
| | When | Purpose |
|---|---|---|
| Middleware | Before route handler | Auth, logging, CORS |
| Guard | After middleware | Authorization (can activate?) |
| Interceptor | Before/after handler | Transform response, logging, caching |
| Pipe | Before handler, parameter level | Validation, transformation |

**Q: How do you handle circular dependencies?**
Use `forwardRef(() => ServiceClass)` in the constructor injection.

**Q: What is `@InjectRepository` vs Prisma approach?**
TypeORM uses `@InjectRepository(Entity)`. Prisma is a query builder — inject `PrismaService` directly. Prisma is type-safe at compile time (generated client), TypeORM relies on decorators.
