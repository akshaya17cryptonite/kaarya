# LocConnect - Local Services Marketplace

A production-ready hyperlocal services marketplace (inspired by Urban Company & Thumbtack) connecting customers with verified, top-rated local service professionals (Plumbers, Electricians, and Home Cleaners) in **Noida, UP (Delhi NCR)** with upfront transparent pricing, slot scheduling, PostGIS geo-radius discovery, and Razorpay escrow payments.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Radix UI primitives, Lucide React
- **Backend**: Next.js Route Handlers & Server Actions (Modular Monolith architecture)
- **Database**: PostgreSQL 15+ via Supabase with PostGIS spatial extension & Prisma ORM
- **Authentication**: Phone OTP + Session Cookie with Role-Based Access Control (`CUSTOMER`, `PROVIDER`, `ADMIN`)
- **Payments**: Razorpay escrow payments (UPI, Cards, Netbanking) with webhook verification, 15% platform commission split + 18% GST on platform fee, and provider payout ledger
- **Maps & Location**: PostGIS `ST_DWithin` spatial proximity queries with multi-radius fallback (5km, 10km, 15km, 25km) & Haversine distance calculations
- **Notifications**: Multi-channel notification driver (SMS via MSG91/Twilio, Email via Resend, In-App notification center)
- **Messaging**: Real-time booking conversation & chat stream between customer and partner
- **Rate Limiting**: Upstash Redis token bucket rate limiting
- **Testing**: Vitest (Unit & Domain test suite) + Playwright (End-to-End browser test suite)
- **Deployment**: Vercel (Web application) + Supabase (PostgreSQL with PostGIS) + Docker multi-stage containerization

---

## 📁 Modular Monolith Architecture

```
loc_connect/
├── e2e/                           # Playwright end-to-end test suites
│   ├── booking-flow.spec.ts       # Full customer discovery, booking & review flow
│   ├── provider-flow.spec.ts      # Provider job acceptance & payout flow
│   └── admin-flow.spec.ts         # Admin KYC approval & dispute resolution
├── prisma/
│   ├── schema.prisma              # Complete data model (15 models + PostGIS)
│   ├── seed.ts                    # Noida seed data (categories, services, providers)
│   └── migrations/                # Database migrations
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── (auth)/                # Customer & Provider authentication portals
│   │   │   ├── login/             # Customer phone OTP login
│   │   │   └── provider-login/    # Provider phone OTP login
│   │   ├── (customer)/            # Customer web portal
│   │   │   ├── account/           # Customer profile, bookings, saved addresses
│   │   │   ├── bookings/[id]/     # Booking tracking, chat & review submission
│   │   │   ├── checkout/[serviceId]/ # Service scheduling, address & payment
│   │   │   ├── providers/[id]/    # Provider profile, verified badges & reviews
│   │   │   └── services/[category]/[city]/ # Localized SEO service discovery
│   │   ├── (provider)/            # Provider operational suite
│   │   │   ├── provider/          # Live stats & daily dispatch dashboard
│   │   │   ├── provider/jobs/     # Job requests (accept/reject) & active tasks
│   │   │   ├── provider/availability/ # Weekly working hours & buffer times
│   │   │   ├── provider/services/ # Custom rate cards & active services
│   │   │   ├── provider/payouts/  # Earnings ledger & withdrawal requests
│   │   │   ├── provider/reviews/  # Customer feedback & partner responses
│   │   │   └── provider/onboarding/ # Multi-step KYC onboarding wizard
│   │   ├── (admin)/               # Admin command tower
│   │   │   ├── admin/             # Executive metrics & platform KPIs
│   │   │   ├── admin/verification/ # KYC verification queue & document inspector
│   │   │   ├── admin/catalog/     # Categories & service offerings manager
│   │   │   ├── admin/bookings/    # Booking management & dispute arbitrator
│   │   │   ├── admin/users/       # Customer & provider user directory
│   │   │   └── admin/settings/    # Platform fee & commission configuration
│   │   ├── api/                   # REST Route Handlers
│   │   │   ├── health/            # System health check endpoint
│   │   │   ├── providers/nearby/  # PostGIS spatial radius search API
│   │   │   └── webhooks/razorpay/ # Cryptographic webhook verification
│   │   ├── globals.css            # Tailwind CSS design system tokens
│   │   └── layout.tsx             # Root layout with navigation & notifications
│   ├── components/                # Reusable UI component library
│   │   ├── admin/                 # Admin KYC inspector, catalog modals & stats
│   │   ├── bookings/              # Booking timeline, tracker & status badges
│   │   ├── chat/                  # Booking messaging stream & quick replies
│   │   ├── common/                # Navbar, Footer, Notification popover
│   │   ├── notifications/         # Notification bell, badge & flyout drawer
│   │   ├── provider/              # Provider job cards, schedule editor, payout tables
│   │   ├── reviews/               # Star ratings, review forms & verified badges
│   │   └── ui/                    # Accessible UI primitives (Button, Card, Dialog, etc.)
│   ├── modules/                   # Domain Logic Modules
│   │   ├── admin/                 # Moderation, KYC approvals, dispute resolution
│   │   ├── auth/                  # Phone OTP verification, JWT sessions & RBAC
│   │   ├── bookings/              # Booking state machine, scheduling & cancellation
│   │   ├── catalog/               # Category tree, service pricing & duration
│   │   ├── chat/                  # Chronological messaging & read receipts
│   │   ├── geo/                   # PostGIS spatial queries & distance calculations
│   │   ├── notifications/         # Multi-channel notification dispatchers
│   │   ├── payments/              # Razorpay escrow orders, commission split & payouts
│   │   ├── providers/             # KYC onboarding, availability & service profiles
│   │   └── reviews/               # Verified reviews & incremental rating updates
│   ├── lib/                       # Infrastructure clients & utilities
│   │   ├── prisma.ts              # Global Prisma client singleton
│   │   ├── supabase/              # Supabase browser, server, and service clients
│   │   └── utils.ts               # Currency formatting, date formatting, cn()
│   ├── middleware.ts              # Edge Route Guard & role-based route protection
│   └── types/                     # TypeScript definitions & data models
├── DEPLOYMENT.md                  # Comprehensive production deployment runbook
├── Dockerfile                     # Multi-stage production Docker container
├── docker-compose.yml             # Local PostgreSQL (PostGIS) & Redis stack
├── vitest.config.ts               # Unit test configuration
└── playwright.config.ts           # E2E test configuration
```

---

## 💰 Commission & Financial Flow

LocConnect operates on an **escrow hold** financial model:

1. **Customer Checkout**:
   - Customer books a service with base price $P$.
   - **Platform Fee**: $15\%$ of base price $= 0.15 \times P$.
   - **GST (Goods & Services Tax)**: $18\%$ applied to the platform fee $= 0.18 \times (0.15 \times P)$.
   - **Total Customer Payable**: $P + (0.15 \times P \times 0.18)$.
2. **Escrow Hold**:
   - Total amount is held in escrow upon payment capture via Razorpay.
3. **Completion & Payout**:
   - Upon successful job completion and customer verification, the escrow is released.
   - **Provider Net Payout**: $85\%$ of base price $= 0.85 \times P$.
   - **Platform Net Revenue**: $15\%$ platform fee.

---

## 🚀 Quickstart & Setup Instructions

### Prerequisites
- **Node.js**: v20 or later
- **npm**: v10 or later
- **Docker** *(Optional, for local PostgreSQL with PostGIS)*

### 1. Clone & Install
```bash
git clone https://github.com/your-org/loc_connect.git
cd loc_connect
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

For **zero-config local development**, `.env.local` runs with mock drivers:
```env
ENABLE_MOCK_DRIVERS=true
```
This enables simulated SMS OTPs, offline Razorpay test checkout, and in-memory rate limiting so you can test all customer, provider, and admin flows without external paid APIs.

### 3. Database Initialization (Optional if using Supabase / Docker)
If running a local PostgreSQL instance via Docker:
```bash
docker compose up -d
npx prisma migrate dev
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Test Accounts

When running with seed data or `ENABLE_MOCK_DRIVERS=true`, the following accounts are pre-configured:

| Role | Phone Number | OTP Code | Description | Default Landing URL |
|---|---|---|---|---|
| **Customer** | `+919876543210` | `123456` | Verified Customer (Rahul Sharma, Sector 62 Noida) | `/account` |
| **Provider** | `+919876543211` | `123456` | Ramesh Verma (Master Plumber, 4.9★, Sector 18 Noida) | `/provider` |
| **Provider** | `+919876543212` | `123456` | Amit Kumar (Expert Electrician, 4.8★, Sector 62 Noida) | `/provider` |
| **Provider** | `+919876543213` | `123456` | Sunita Devi (Deep Cleaning Specialist, 4.9★, Sector 50 Noida) | `/provider` |
| **Admin** | `+919876543299` | `123456` | Platform Operations Superadmin | `/admin` |

---

## 🧪 Testing

### Unit & Domain Logic Tests (Vitest)
Executes all 57+ unit tests covering financial splits, booking state machine transitions, PostGIS distance formulas, review rating updates, and RBAC authorization:
```bash
npm run test
```

### Type Checking & Linting
Enforces 100% strict TypeScript types and clean ESLint rules:
```bash
npm run typecheck
npm run lint
```

### End-to-End Tests (Playwright)
Executes browser automation tests simulating user journeys:
```bash
npx playwright test
```

---

## 🌐 API & Webhook Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint returning database connectivity status |
| `GET` | `/api/providers/nearby` | Geo-radius query (`?category=plumber&lat=28.62&lng=77.36&radius=15`) |
| `POST` | `/api/webhooks/razorpay` | Cryptographic signature verified webhook for Razorpay payment captures & refunds |

---

## 📦 Production Deployment

Refer to [DEPLOYMENT.md](file:///c:/projects/loc_connect/DEPLOYMENT.md) for complete production setup instructions on **Vercel** + **Supabase PostGIS**.

---

## 📄 License
MIT
