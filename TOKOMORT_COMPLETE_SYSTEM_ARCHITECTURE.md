# TOKOMORT: Complete End-to-End System Architecture Documentation

Welcome to the definitive system architecture documentation for the **TOKOMORT Production-Level Multi-Vendor E-Commerce Platform**. 

This document serves as an enterprise-grade technical blueprint detailing the frontend, backend, database models, real-time logistics tracking, automated payment settlements, and roles protection strategies that power TOKOMORT.

---

## 📖 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Database Schema](#4-database-schema)
5. [Authentication Flow](#5-authentication-flow)
6. [Vendor Flow](#6-vendor-flow)
7. [Admin Flow](#7-admin-flow)
8. [Delivery Flow](#8-delivery-flow)
9. [Customer Flow](#9-customer-flow)
10. [Product Approval Flow](#10-product-approval-flow)
11. [Payment Flow](#11-payment-flow)
12. [Realtime Socket.IO Events](#12-realtime-socketio-events)
13. [Settlement System](#13-settlement-system)
14. [API Structure](#14-api-structure)
15. [Dashboard Structure](#15-dashboard-structure)
16. [Deployment Guide](#16-deployment-guide)
17. [Production Checklist](#17-production-checklist)
18. [Security Checklist](#18-security-checklist)
19. [Identified Technical Mismatches & Broken Flows](#19-identified-technical-mismatches--broken-flows)
20. [Missing Features & Recommended Improvements](#20-missing-features--recommended-improvements)

---

## 1. Project Overview

**TOKOMORT** is a high-performance, production-ready multi-vendor e-commerce platform designed with integrated hyper-local logistics (local delivery boys) and national third-party fulfillment (Shiprocket). 

Architecturally, the platform mirrors systems like **Amazon (Multi-Vendor Catalog & Logistics)**, **Swiggy/Blinkit (Hyper-local distance-based routing)**, and **Razorpay/Flipkart (Settlement Ledgers)**.

### Platform Topology

```mermaid
graph TD
    User([Customer]) -->|HTTPS| FE[Next.js Storefront]
    Admin([Administrator]) -->|HTTPS| FE
    Vendor([Vendor Partner]) -->|HTTPS| FE
    Rider([Delivery Boy]) -->|WS/HTTPS| FE
    
    FE -->|API Requests| BE[NestJS Backend Gateway]
    BE -->|ORM / SQL| DB[(PostgreSQL DB)]
    BE -->|Live Map WS| WS[Socket.IO Gateway Namespace]
    
    BE -->|Gateway Actions| RP[Razorpay Payment API]
    BE -->|Logistics sync| SR[Shiprocket API]
```

---

## 2. Frontend Architecture

The frontend is built on **Next.js 15 App Router** using TypeScript, utilizing advanced Server Components (RSC) for initial page loads and hydration, alongside Client Components for interactive dashboard elements.

### Key Technology Stack
- **Routing**: Next.js 15 App Router (Parallel layouts, segment protection).
- **Styling**: Tailwind CSS, Vanilla CSS, Lucide icons, Framer Motion.
- **State Management**: Redux Toolkit (Synchronous client states: Cart, UI states, Local caching).
- **Server Cache & Sync**: React Query (TanStack Query v5) for optimistic mutations and automatic intervals refetching.
- **API Client**: Axios (configured with interceptors to handle token refresh and unauthorized retries automatically).
- **Websockets Client**: Socket.io-client (integrated in the React Context provider).
- **Real-time Map Visuals**: Leaflet.js with dynamic dynamic rendering.

### Folder Structure Overview
```
├── app
│   ├── (auth)          # Registration, login, role layouts
│   ├── (store)         # Public storefront, shopping catalog, checkout, tracking
│   ├── dashboard       # Unified user dashboards (Admin, Vendor, Customer, Delivery)
│   ├── vendor          # Vendor onboarding pages
│   ├── delivery        # Rider onboarding pages
│   └── middleware.ts   # Edge route routing protection
├── components          # Shared components (UI button, badges, selects, maps)
├── providers           # React Context (Auth, Redux, React Query, Socket.IO)
├── services            # Axios HTTP service wrappers (order, product, delivery, etc.)
├── store               # Redux state slices (auth, cart, ui, wishlist)
└── types               # Global TypeScript definitions
```

---

## 3. Backend Architecture

Built using **NestJS**, the backend utilizes a modular, dependency-injected design pattern optimized for horizontal scalability and high event-driven throughput.

### Modules Breakdown
- **`AuthModule`**: Handles security credentials, JWT generation/rotation, hash verifications, and roles assignment.
- **`UsersModule`**: Profiles management, addresses, and customer profiles.
- **`VendorModule`**: Vendor onboarding documentation, KYC validation, bank settings, and payout records.
- **`ProductsModule`**: Category trees, catalog inventories, variants configurations, and ratings.
- **`OrdersModule`**: Customer checkouts, items calculation, states transitions, and invoicing.
- **`PaymentsModule`**: Razorpay integrations, order generation, webhook signature validation, and database ledgers posting.
- **`DeliveryModule`**: Rider KYC, profile verification, active coords mapping, availability toggles, and live routes.
- **`TrackingModule`**: Socket.IO tracking gateway, namespaces, room managers, and client notification triggers.
- **`NotificationsModule`**: Platform-wide real-time notification alerts.
- **`ShippingModule`**: Third-party integration (Shiprocket AWB dispatch, dimensions mapping, distance classifications).

---

## 4. Database Schema

TOKOMORT operates on a **PostgreSQL** database managed through **Prisma ORM**. The schema is optimized with indexes and cascading rules to support fast transactions and strong data integrity.

### Verified Relational Models Map

```mermaid
erDiagram
    users ||--o| vendors : "1-to-1 User Profile"
    users ||--o| delivery_boys : "1-to-1 Rider Profile"
    users ||--o{ addresses : "1-to-Many Locations"
    users ||--o{ orders : "1-to-Many Customer Purchases"
    users ||--o| carts : "1-to-1 Shopping Cart"
    
    vendors ||--o{ products : "1-to-Many Inventory Catalog"
    vendors ||--o{ commissions : "1-to-Many Commission Accruals"
    vendors ||--o{ vendor_settlements : "1-to-Many Bank Payouts"
    
    delivery_boys ||--o{ order_deliveries : "1-to-Many Active Assignments"
    delivery_boys ||--o{ delivery_tracking : "1-to-Many GPS History logs"
    delivery_boys ||--o{ delivery_payouts : "1-to-Many Earnings logs"
    
    categories ||--o{ products : "1-to-Many Catalog mapping"
    products ||--o{ product_variants : "1-to-Many Options"
    
    orders ||--o{ order_items : "1-to-Many Purchased items"
    orders ||--o| payments : "1-to-1 Razorpay Transaction Ledger"
    orders ||--o| order_deliveries : "1-to-1 Delivery Boy Status"
```

### Models & Columns Summary
- **`User`**: Core identifiers, role classification (`CUSTOMER`, `VENDOR`, `DELIVERY_BOY`, `ADMIN`), status (`isActive`), and authentication fields.
- **`Vendor`**: Store name, logo, banner, GSTIN, PAN, and Bank details for platform payouts.
- **`DeliveryBoy`**: GPS coordinates (`currentLatitude`, `currentLongitude`), vehicle metadata, KYC status, and availability.
- **`Address`**: Label ("Home", "Work"), PIN code, address line, and coordinates (`latitude`, `longitude`) used in hyper-local auto-routing.
- **`Product`**: Vendor ID, category, SKU, stock levels, compare price, and approval status (`PENDING`, `APPROVED`, `REJECTED`, `DRAFT`).
- **`Order`**: Tracks order status (`PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) and logistics details (`deliveryType`, `shiprocketOrderId`, `awbCode`).
- **`Payment`**: Razorpay ID mappings, amount, currency, status, and webhook tracking.
- **`PaymentLedger`**: Financial breakdown (subtotal, commissions, GST, delivery payouts, net earnings).

---

## 5. Authentication Flow

Authentication is built around highly secure **JSON Web Tokens (JWT)** managed at the Next.js routing edge and verified at the NestJS backend controllers.

```
[Customer Client] 
   │
   ├─► 1. Enters login credentials on Frontend (/auth/login)
   ├─► 2. Frontend posts credentials to backend API (/auth/login)
   │
   [NestJS Gateway]
   │
   ├─► 3. Verifies credentials and generates JWT Access + Refresh tokens
   ├─► 4. Responds to Client, setting cookies ("tokomort_access_token")
   │
   [Next.js Edge Middleware]
   │
   ├─► 5. Intercepts dashboard route request
   ├─► 6. Extracts cookie and decodes claims (Role claim: "ADMIN")
   ├─► 7. Grants entry or redirects to "/unauthorized" / "/auth/login"
```

---

## 6. Vendor Flow

The vendor flow covers registration, KYC documentation, product listings creation, inventory management, and payout verification.

1. **Vendor Registration**: User signs up and selects the `VENDOR` profile on `/auth/register`.
2. **KYC Onboarding**: Vendor is directed to `/vendor/onboarding` to upload their GSTIN, PAN Card, Aadhaar Card, and Bank details.
3. **Draft Catalog**: Vendor uploads products. New items are marked as `ApprovalStatus.PENDING` and are not shown publicly on the storefront.
4. **Sales Dashboard**: Displays live revenue charts, pending payouts, order lists, and commission deductions.

---

## 7. Admin Flow

Platform administrators hold master control over platform operations, KYC processing, product approvals, and financial overrides.

- **KYC Review Dashboard**: Admin approves/rejects registered vendors and delivery boys after reviewing document uploads.
- **Catalog Approval Pipeline**: Admin reviews product details, prices, and SKUs, and transitions the state to `APPROVED` to publish the listing publicly.
- **Logistics Control Panel**: Admin manages order routes, manually overrides delivery types (Local vs. Shiprocket), and triggers manual Shiprocket order creation.

---

## 8. Delivery Flow

Automated local routing and live updates keep delivery boys and customers in sync.

### Auto-Assignment Flow
```mermaid
flowchart TD
    A[Order Placed & Paid] --> B{Delivery Type?}
    B -->|SHIPROCKET| C[Dispatched via Shiprocket - AWB Generated]
    B -->|LOCAL| D{Has Address GPS Coords?}
    
    D -->|YES| E[Find all APPROVED, Available Riders]
    E --> F[Calculate nearest rider using Harversine Formula]
    F --> G[Assign Order to Closest Rider]
    
    D -->|NO| H[Fallback: Assign to Rider with least-loaded deliveries]
    H --> I[Rider receives real-time assignment notification via WS]
```

### Order Delivery Lifecycle & Status Updates
1. **Rider Notification**: Rider receives an alert on `/dashboard/delivery` and accepts the assignment.
2. **`PICKED_UP`**: Rider arrives at the vendor's shop, picks up the package, and changes status to `PICKED_UP`.
3. **`IN_TRANSIT`**: Rider starts navigation. The backend tracks live coordinates (`currentLatitude`, `currentLongitude`) and broadcasts them to the customer page over WebSockets.
4. **`OUT_FOR_DELIVERY`**: Rider approaches the destination. The customer page shows the Rider marker and a unique **4-digit Delivery OTP**.
5. **`DELIVERED`**: Rider inputs the 4-digit customer OTP on their dashboard to complete the delivery and trigger the settlement ledger.

---

## 9. Customer Flow

1. **Browsing**: User browses the storefront, filters categories, and views approved products.
2. **Multi-Vendor Cart**: Items from different vendors are added to the cart, with Redux keeping client state in sync.
3. **Address Mapping**: During checkout, the customer selects or adds an address, generating GPS coordinates via the Leaflet geocoder.
4. **Checkout**: Customer initiates payment using Razorpay or COD.
5. **Real-time Live Tracking**: Customer tracks the order on `/orders/[id]/tracking` via a beautiful Leaflet map for local riders, or a live timeline of courier scans for Shiprocket orders.

---

## 10. Product Approval Flow

```
[Vendor Product Creation]
   │
   ├─► 1. Product is saved in database as "ApprovalStatus.PENDING"
   │
   [Admin Panel Approval]
   │
   ├─► 2. Admin clicks "Approve Product" in Admin Dashboard
   ├─► 3. API patch transitions approval status to "APPROVED" and "isPublished: true"
   │
   [Real-time Synchronization]
   │
   ├─► 4. Backend emits WebSocket event "product.approved"
   ├─► 5. Storefront automatically updates to display the new listing
```

---

## 11. Payment Flow

TOKOMORT features a highly secure, transaction-safe online payment integration with Razorpay.

```
[Customer Checkout Page]
   │
   ├─► 1. Initiates checkout transaction
   ├─► 2. Backend generates Razorpay Order (e.g., "order_pay_123")
   │
   [Razorpay Frontend Gateway]
   │
   ├─► 3. Renders payment modal to customer
   ├─► 4. User successfully pays via card/UPI
   ├─► 5. Razorpay responds with Payment ID & Signature
   │
   [NestJS Verification Gateway]
   │
   ├─► 6. Frontend posts Payment response to backend
   ├─► 7. Backend verifies SHA-256 HMAC Signature
   ├─► 8. Success: Transition Order to "CONFIRMED"
   ├─► 9. Backend inserts Idempotent Webhook mapping to Payment Ledger
```

---

## 12. Realtime Socket.IO Events

The platform uses a Socket.IO gateway namespace (`/tracking`) to manage all real-time events.

### Events & Namespace Details
- **`join-user-room`**: Subscribes clients to their personal room (`user_<userId>`) to receive instant transactional, KYC, and security alerts.
- **`join-order-room`**: Subscribes customers and admins to an order room (`order_<orderId>`) to receive status updates.
- **`order-status-update`**: Emitted by the backend when an order transitions state (e.g., `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`), prompting the frontend to update pages automatically.
- **`location-update`**: Emitted by the rider app to broadcast live GPS coordinates, updating the customer tracking map dynamically.
- **`delivery.registered` / `delivery.onboarded`**: Real-time notifications sent to the admin dashboard when new riders register or complete KYC.

---

## 13. Settlement System

When an order is successfully completed (`DELIVERED`), the platform's financial settlement engine automatically calculates splits for the ledger.

### Settlement Math & Commission Splits

| Fee/Split Item | Calculation Formula | Target Recipient |
| :--- | :--- | :--- |
| **Gross Total** | Customers' paid amount (Subtotal + Shipping) | Platform Vault |
| **Razorpay Fee** | 2.0% of Gross Total | Razorpay Gateway |
| **Platform Commission** | 10.0% of Product Subtotal | Admin Revenue |
| **GST on Commission** | 18% of Platform Commission Amount | Government Tax |
| **Local Rider Share** | 60% of Shipping Charge | Delivery Boy Wallet |
| **Vendor Earning** | Subtotal − Platform Commission − Commission GST | Vendor Wallet |

---

## 14. API Structure

| HTTP Method | Route Endpoint | Controller Module | Description | Protected |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | `AuthController` | User registration | Public |
| **POST** | `/auth/login` | `AuthController` | User login & token generation | Public |
| **POST** | `/auth/refresh` | `AuthController` | Generates a new access token | Public |
| **GET** | `/orders/:id/tracking` | `OrdersController` | Customer tracking page payload | Customer |
| **GET** | `/admin/orders` | `AdminController` | Admin dashboard order list | Admin |
| **PATCH** | `/admin/orders/:id/status` | `AdminController` | Update order state | Admin |
| **PATCH** | `/admin/orders/:id/delivery-type`| `AdminController` | Toggle Local vs. Shiprocket | Admin |
| **POST** | `/admin/orders/:id/shiprocket-ship`| `AdminController` | Dispatch order to Shiprocket | Admin |
| **POST** | `/delivery/location` | `DeliveryController` | Rider live location broadcast | Rider |
| **PUT** | `/delivery/deliveries/:id/status`| `DeliveryController` | Rider updates delivery status | Rider |

---

## 15. Dashboard Structure

### Admin Dashboard Tabs
1. **Analytics Summary**: Live charts tracking gross sales, net profit, commissions, and platform expenses.
2. **Vendors KYC Hub**: Lists registered vendors with document images, approval triggers, and rejection panels.
3. **Logistics Monitor**: Live Leaflet fleet map tracking all active local delivery boys in the field.
4. **Orders Desk**: Order list with detailed logistics panels to change delivery types, assign riders, or dispatch via Shiprocket.

### Vendor Dashboard Tabs
1. **Catalog Inventory**: Add, edit, or delete product listings and manage variations.
2. **Order Receipts**: View ordered items, pack shipments, and update stock status.
3. **Financial Wallet**: Request bank payouts and check past settlements.

---

## 16. Deployment Guide

### Database Setup
1. Spin up a production-ready PostgreSQL instance (e.g., Supabase or AWS RDS).
2. Configure dynamic connection pooling inside `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@db-host:5432/tokomort?schema=public&pgbouncer=true"
   ```
3. Run migrations on the NestJS server:
   ```bash
   npx prisma migrate deploy
   ```

### NestJS Backend Server (PM2 / Docker)
- Deploy using PM2 on a VPS instance:
  ```bash
  pm2 start dist/main.js --name "tokomort-backend" -i max
  ```

### Nginx Reverse Proxy Config for Socket.IO
```nginx
location /socket.io/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```

---

## 17. Production Checklist
- [ ] Enable `pgbouncer` connection pooling on PostgreSQL.
- [ ] Add JWT secret key rotations inside key storage vaults.
- [ ] Set `NODE_ENV=production` inside server environments.
- [ ] Configure Rate Limiters on critical API routes (`/auth/login`, `/auth/register`).
- [ ] Add error logger monitors (e.g., Sentry) to trace crashes.

---

## 18. Security Checklist
- [ ] Force HTTPS protocol on both storefront and backend endpoints.
- [ ] Secure JWT cookies with `HttpOnly`, `Secure`, and `SameSite=Strict` policies.
- [ ] Enable CORS protections, restricting backend access to your production domain only.
- [ ] Sanitize API payloads to prevent SQL injection or cross-site scripting (XSS).

---

## 19. Identified Technical Mismatches & Broken Flows

During deep analysis, the following structural mismatches and logical gaps were identified and resolved to ensure high-performance production readiness:

### 1. Leaflet Map Coordinates Typings Mismatch
- **Mismatch:** The frontend Leaflet map expected `order.address?.lat` and `order.address?.lng`, while the Prisma schema uses `latitude` and `longitude`.
- **Impact:** Address geocoding coordinates failed to parse, causing Leaflet map initialization errors and breaking the live tracking screen.
- **Resolution:** Added `latitude` and `longitude` fields to the frontend `Address` typescript interface and implemented a robust fallback chain on the map client.

### 2. Auto-Assignment Distance Bypass
- **Gap:** The backend payment processor automatically assigned local delivery boys to all orders immediately upon verification, regardless of distance.
- **Impact:** An order placed 200 km away would still trigger local rider assignment, causing logistics failures.
- **Resolution:** Added conditional checks to both payments verification and COD checkout pathways, restricting local rider auto-assignment strictly to orders where `deliveryType === 'LOCAL'`.

### 3. Shiprocket Dispatch Integration Gap
- **Gap:** The backend defined a `ShippingService` with methods for Shiprocket dispatch, but no controller endpoints existed for administrators to trigger shipping.
- **Impact:** Admin had no interface to dispatch third-party orders or view AWB codes.
- **Resolution:** Created `PATCH /admin/orders/:orderId/delivery-type` and `POST /admin/orders/:orderId/shiprocket-ship` API endpoints, and designed a premium **Manage Logistics** interface in the admin panel to allow easy shipping controls.

---

## 20. Missing Features & Recommended Improvements

To transition TOKOMORT into an industry-leading storefront like Flipkart or Swiggy, we recommend implementing the following high-priority features:

### 1. Interstate IGST Taxation Rules
- **Problem:** Currently, the system calculates standard GST (CGST + SGST) for all transactions.
- **Solution:** Add state validation between the Vendor's registered location and the Customer's delivery address to apply Interstate GST (IGST 18%) instead of CGST/SGST (9% each) when cross-border shipping is detected.

### 2. Mapbox/Google Maps Directions Caching
- **Problem:** Constantly querying geocoders for routes on Leaflet or Mapbox can result in high API usage fees.
- **Solution:** Implement server-side Redis caching for geocoded address coordinates and routing patterns to speed up calculations.

### 3. Mobile Push Notifications Integration
- **Problem:** WebSockets are highly active but close as soon as the user closes their browser or locks their phone screen.
- **Solution:** Integrate Firebase Cloud Messaging (FCM) to trigger background push notifications when riders transition order status to `OUT_FOR_DELIVERY` or complete delivery.
