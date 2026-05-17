# 👨‍💻 Mallesh N — Full Stack Developer

> 5+ Years building production-grade web applications · TOKOMORT Multi-Vendor Platform Author

---

## 🚀 Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-593D88?style=flat&logo=redux)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis)

### DevOps & Realtime
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=flat&logo=razorpay)

---

## 🏗️ Flagship Project: TOKOMORT

> **Production-level Multi-Vendor E-commerce Platform** — Amazon/Flipkart/Swiggy inspired architecture

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                     TOKOMORT PLATFORM                            │
├──────────────┬───────────────┬─────────────────┬────────────────┤
│   CUSTOMER   │    VENDOR     │     ADMIN        │  DELIVERY BOY  │
│  (Store UI)  │  (Dashboard)  │  (Control Panel) │   (Mobile UI)  │
├──────────────┴───────────────┴─────────────────┴────────────────┤
│              Next.js 15 App Router (Frontend)                    │
│         Redux Toolkit + React Query + Socket.IO Client           │
├──────────────────────────────────────────────────────────────────┤
│              NestJS REST API + WebSocket Gateway                  │
│           JWT Auth · Guards · Interceptors · Pipes               │
├───────────────────┬──────────────────────────────────────────────┤
│   PostgreSQL      │   Redis (Cache + BullMQ Queues)               │
│   (via Prisma)    │   Socket.IO (Realtime Events)                 │
└───────────────────┴──────────────────────────────────────────────┘
```

### Key Features
- **4 Role System**: CUSTOMER · VENDOR · ADMIN · DELIVERY_BOY — each with dedicated UI + JWT middleware protection
- **Razorpay Production Payments** — HMAC signature verification, settlement accounting, webhook handler
- **Real-time Order Tracking** — Leaflet maps, Socket.IO GPS broadcast every 5 seconds, live status timeline
- **Financial Analytics** — Platform commission (10%), GST (18%), vendor earnings, delivery payouts tracked per-order
- **Delivery OTP Verification** — Customer gets 4-digit OTP, delivery boy enters it to confirm delivery
- **Admin Live Dashboard** — Real-time counters, payment totals, vendor/delivery payouts, refund management
- **Product Approval Workflow** — Vendors submit → Admin approves → Live notification to vendor
- **KYC Onboarding** — Vendor & Delivery Boy 4-step registration with document uploads

### Financial Model
```
Order Total = Product Amount + GST (18%) + Delivery Fee
Platform Commission = Product Amount × 10%
Vendor Earnings = Product Amount - Platform Commission
Delivery Boy Earnings = Delivery Fee × 60%
Razorpay Fee = Order Total × 2%
Net Platform Profit = Commission - Delivery Payout - Razorpay Fee
```

---

## 📁 Repository Structure

```
interview-prep/
├── README.md                      ← This file (profile + project overview)
├── JAVASCRIPT_INTERVIEW.md        ← JS fundamentals to advanced
├── REACT_INTERVIEW.md             ← React + Redux + React Query
├── NEXTJS_INTERVIEW.md            ← Next.js 15 App Router deep dive
├── NODEJS_INTERVIEW.md            ← Node.js + Express.js
├── NESTJS_INTERVIEW.md            ← NestJS architecture + Prisma
├── DEVOPS_INTERVIEW.md            ← Docker · Nginx · CI/CD · AWS
├── SYSTEM_DESIGN.md               ← Architecture patterns + scaling
├── CODING_QUESTIONS.md            ← DSA + JS logical questions
├── TOKOMORT_PROJECT_EXPLANATION.md← How to explain TOKOMORT in interviews
└── CHEATSHEETS.md                 ← Git · Linux · Docker · Prisma commands
```

---

## 🎯 Skills Summary

| Domain | Technologies |
|---|---|
| Frontend | React 18, Next.js 15, TypeScript, Redux Toolkit, React Query v5, Tailwind CSS, Framer Motion |
| Backend | NestJS, Express.js, Prisma ORM, JWT, REST APIs, WebSockets |
| Database | PostgreSQL, MongoDB, Redis |
| Realtime | Socket.IO, WebSocket, GPS tracking, Push notifications |
| Payments | Razorpay (HMAC verification, webhooks, settlement) |
| DevOps | Docker, Nginx, PM2, GitHub Actions CI/CD, AWS EC2/S3 |
| Auth | JWT, Refresh tokens, RBAC, OTP, OAuth (Google) |

---

## 🏆 Achievements

- Built and deployed a production multi-vendor e-commerce platform from scratch
- Implemented enterprise-level role-based access control (4 roles, 2-layer protection)
- Integrated Razorpay live payments with HMAC verification and full settlement accounting
- Built real-time GPS delivery tracking with Socket.IO broadcasting at 5-second intervals
- Designed financial analytics system tracking GST, commission, and payout per order
- Implemented KYC document upload and admin approval workflow

---

## 💬 Interview Summary (30-second pitch)

> "I'm a Full Stack Developer with 3+ years of experience specializing in React/Next.js on the frontend and NestJS/PostgreSQL on the backend. My flagship project TOKOMORT is a production multi-vendor e-commerce platform with real-time delivery tracking, Razorpay payments, and a 4-role RBAC system. I'm comfortable with the full stack — from designing Prisma schemas to building Socket.IO gateways to deploying on Docker/Nginx. I focus on production-quality code: proper error handling, security, performance, and scalability."
