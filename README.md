# LocConnect - Local Services Marketplace (MVP)

A production-ready MVP of a local on-demand services marketplace (inspired by Urban Company & Thumbtack) connecting customers with verified, top-rated local service professionals (plumbers, electricians, and home cleaners) with fixed pricing, slot scheduling, PostGIS geo-discovery, and Razorpay escrow payments.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui design tokens
- **Backend**: Next.js Route Handlers & Server Actions (Modular Monolith architecture)
- **Database**: PostgreSQL via Supabase with PostGIS spatial extension, Prisma ORM
- **Authentication**: Supabase Auth (Phone OTP + Email Magic Link) with custom Role-Based Access Control (`CUSTOMER`, `PROVIDER`, `ADMIN`)
- **Payments**: Razorpay (UPI, Credit/Debit Cards, Netbanking) with webhook verification, 15% platform commission split & provider payout ledger
- **Maps & Location**: Google Maps API (Places autocomplete, reverse geocoding, distance matrix) & PostGIS `ST_DWithin` queries
- **Storage**: Supabase Storage for profile avatars and KYC verification documents
- **Notifications**: Multi-channel notification driver (SMS via MSG91/Twilio, Email via Resend, In-App via Supabase Realtime)
- **Caching & Rate Limiting**: Upstash Redis & `@upstash/ratelimit`
- **Validation & Forms**: Zod + React Hook Form
- **Testing**: Vitest + React Testing Library (Unit/Integration), Playwright (E2E)
- **Deployment**: Vercel (Web App) + Supabase (Database & Storage), Docker multi-stage containerization, GitHub Actions CI/CD

---

## 📁 Modular Monolith Directory Structure

```
loc_connect/
├── .github/workflows/ci.yml       # GitHub Actions CI workflow (lint, typecheck, test, build)
├── docker-compose.yml             # Local PostgreSQL 16 (PostGIS) + Redis 7
├── Dockerfile                     # Multi-stage production Docker container
├── public/                        # Static assets & robots.txt
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── (auth)/                # Customer & Provider auth routes
│   │   ├── (customer)/            # Customer search, bookings, service discovery
│   │   ├── (provider)/            # Provider onboarding, dashboard, jobs
│   │   ├── (admin)/               # Admin management, KYC verification, analytics
│   │   ├── api/                   # Route handlers & webhooks (/api/webhooks/razorpay)
│   │   ├── globals.css            # Tailwind + shadcn/ui design system tokens
│   │   └── layout.tsx             # Root layout with fonts & providers
│   ├── components/                # Reusable UI components
│   │   ├── ui/                    # shadcn/ui primitives (Button, Card, Badge, etc.)
│   │   ├── common/                # Navbar, Footer, Providers
│   │   ├── customer/              # Customer-specific components
│   │   ├── provider/              # Provider dashboard components
│   │   └── admin/                 # Admin data tables and metrics
│   ├── modules/                   # Domain Services (Modular Monolith Layer)
│   │   ├── auth/                  # RBAC session validation & permissions
│   │   ├── bookings/              # Booking lifecycle & state machines
│   │   ├── catalog/               # Service categories, offerings & pricing
│   │   ├── geo/                   # PostGIS queries & Haversine distance calculations
│   │   ├── notifications/         # SMS, Email & Realtime dispatchers
│   │   ├── payments/              # Razorpay checkout, escrow & payouts
│   │   ├── providers/             # Provider profiles & onboarding
│   │   ├── reviews/               # Review submissions & rating recalculations
│   │   └── users/                 # Customer profiles & saved addresses
│   ├── lib/                       # Core clients & shared utilities
│   │   ├── supabase/              # Browser, Server, and Admin Supabase clients
│   │   └── utils.ts               # Formatting (currency, distance, dates), clsx cn()
│   ├── config/
│   │   └── site.ts                # Site metadata, launch city (Noida), categories
│   └── types/
│       └── index.ts               # Complete TypeScript types and DB enums
├── .env.example                   # Thoroughly documented environment variables
├── package.json                   # Dependencies and scripts
├── tailwind.config.ts             # Tailwind CSS configuration with design tokens
├── tsconfig.json                  # TypeScript compiler settings
└── vitest.config.ts               # Vitest test runner configuration
```

---

## 🚀 Quickstart & Setup Instructions

### Prerequisites
- **Node.js**: v20 or later
- **npm**: v10 or later
- **Docker** *(Optional, for local PostGIS and Redis)*

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd loc_connect
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy the documented `.env.example` file to create `.env.local`:
```bash
cp .env.example .env.local
```

For zero-setup local offline development, `.env.local` is pre-configured with:
```env
ENABLE_MOCK_DRIVERS=true
```
This enables simulated SMS OTP, offline Razorpay test checkout, and in-memory rate limiting so you can test all flows without requiring third-party API keys upfront.

### 3. Run Local Database (Optional)
If running a local PostgreSQL database with PostGIS:
```bash
docker compose up -d
```
This boots:
- PostgreSQL 16 + PostGIS on `localhost:5432` (`loc_user` / `loc_password` / `loc_connect_db`)
- Redis 7 on `localhost:6379`

### 4. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server at [http://localhost:3000](http://localhost:3000) |
| `npm run test` | Executes unit and domain tests with Vitest |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run typecheck` | Runs `tsc --noEmit` to verify 100% strict TypeScript types |
| `npm run lint` | Runs ESLint over all source files |
| `npm run build` | Compiles an optimized Next.js standalone production build |
| `npm start` | Launches the production standalone server |

---

## 🎯 Initial Launch Scope (MVP)

- **Launch City**: **Noida, Uttar Pradesh** (Coordinates: `28.5355° N, 77.3910° E`) with multi-radius discovery (5 km, 10 km, 15 km, 25 km).
- **3 Core Categories**:
  1. 🔧 **Plumbing Services** (Tap & shower repair, pipe leakage, sanitary fitting, water tank cleaning, geyser installation)
  2. ⚡ **Electrical Services** (Ceiling fan repair, switchboard replacement, MCB fuse tripping, house inverter wiring, decorative lighting)
  3. 🧹 **Home Cleaning** (Full home deep cleaning, intensive bathroom descaling, modular kitchen degreasing, sofa shampooing)

---

## 🗺 Implementation Roadmap

- [x] **Phase 1**: Project structure, setup instructions, and `.env.example`
- [ ] **Phase 2**: Database schema, PostGIS migrations, and seed data
- [ ] **Phase 3**: Auth and role-based routing (Customer, Provider, Admin)
- [ ] **Phase 4**: Customer flows (discovery, search, provider profile, slot booking, payment)
- [ ] **Phase 5**: Provider dashboard and onboarding (KYC submission, job acceptance, earnings)
- [ ] **Phase 6**: Admin panel (KYC approvals, categories, bookings, dispute management)
- [ ] **Phase 7**: Reviews, chat, and notifications
- [ ] **Phase 8**: Testing, deployment guide, and final validation
