# LocConnect - Production Deployment Guide & Runbook

This runbook provides step-by-step instructions for deploying **LocConnect** (Hyperlocal Services Marketplace for Noida, UP) to production using **Vercel** (Next.js Application), **Supabase** (PostgreSQL with PostGIS), **Upstash Redis** (Distributed Rate Limiting), **Razorpay** (Payments & Escrow), and **Resend / MSG91** (Transactional Notifications).

---

## 1. System Architecture & Topology

```
                       [ Customer / Provider / Admin Browser ]
                                         │
                                         ▼ HTTPS
                            [ Cloudflare / Vercel Edge CDN ]
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         [ Next.js 14 App Router ]                [ Next.js Edge Middleware ]
         (SSR, API Routes, Actions)              (Role RBAC, Session Cookies)
                    │                                         │
        ┌───────────┼────────────────────┬────────────────────┘
        ▼           ▼                    ▼
[ Supabase PostGIS ] [ Upstash Redis ] [ Razorpay Gateway ]
 (PostgreSQL 15+)   (Token Bucket)   (Escrow & Webhooks)
        │
        ▼
[ SMS & Email Providers ]
 (MSG91 / Twilio / Resend)
```

---

## 2. Infrastructure & Service Prerequisites

Before deploying, ensure you have active accounts with the following providers:

1. **Supabase** (or any managed PostgreSQL instance with PostGIS support). Recommended region: `ap-south-1` (Mumbai, closest to Delhi NCR / Noida).
2. **Vercel** (for hosting Next.js 14 App Router).
3. **Upstash** (Serverless Redis for sliding-window rate limiting).
4. **Razorpay Dashboard** (Indian Rupee payment gateway with webhook support).
5. **Resend** or **SendGrid** (Transactional email provider with verified DNS records).
6. **MSG91** or **Twilio** (DLT-registered Indian transactional SMS gateway).

---

## 3. Step-by-Step Production Setup

### Step 1: Provision Database with PostGIS on Supabase

1. Create a new Supabase project named `loc-connect-prod` in the **Mumbai (`ap-south-1`)** region.
2. In the Supabase SQL Editor, enable the **PostGIS** extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
3. Retrieve your database credentials from **Project Settings > Database**:
   - **Transaction Connection String (Port 6543)** with connection pooling: Used for runtime queries (`DATABASE_URL`).
   - **Direct Connection String (Port 5432)** without pooling: Used for Prisma migrations (`DIRECT_URL`).

### Step 2: Configure Environment Variables

Create and populate the production environment variables in Vercel or your production `.env` file:

```env
# -----------------------------------------------------------------------------
# APP ENVIRONMENT & SECRETS
# -----------------------------------------------------------------------------
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://locconnect.in
APP_SECRET=your_32_character_cryptographically_secure_random_string_here

# Set to false in production to enforce real database, SMS, email, and Razorpay
ENABLE_MOCK_DRIVERS=false

# -----------------------------------------------------------------------------
# SUPABASE / POSTGRESQL (WITH POSTGIS)
# -----------------------------------------------------------------------------
# Transaction pooler (Port 6543) with pg_bouncer parameter
DATABASE_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (Port 5432) for running migrations
DIRECT_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# Supabase Auth & Storage API
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# -----------------------------------------------------------------------------
# UPSTASH REDIS (RATE LIMITING & SESSIONS)
# -----------------------------------------------------------------------------
UPSTASH_REDIS_REST_URL=https://[DATABASE_NAME].upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx...

# -----------------------------------------------------------------------------
# RAZORPAY PAYMENT GATEWAY
# -----------------------------------------------------------------------------
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_configured_webhook_secret_key

# -----------------------------------------------------------------------------
# NOTIFICATIONS (SMS & EMAIL)
# -----------------------------------------------------------------------------
# Transactional Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
NOTIFICATION_FROM_EMAIL=support@locconnect.in

# Transactional SMS (MSG91 / DLT Compliant for India)
MSG91_AUTH_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
MSG91_SENDER_ID=LOCCON
MSG91_OTP_TEMPLATE_ID=xxxxxxxxxxxx
```

---

### Step 3: Run Database Migrations & Seeds

In your deployment pipeline or local terminal connected to production Supabase:

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Deploy Schema Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify PostGIS Geometry Triggers & Functions:**
   Execute the PostGIS spatial sync triggers so provider lat/lng coordinates automatically populate the PostGIS geometry column:
   ```sql
   -- Sync lat/long to PostGIS point automatically
   CREATE OR REPLACE FUNCTION sync_provider_location()
   RETURNS TRIGGER AS $$
   BEGIN
     IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
       NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   DROP TRIGGER IF EXISTS trg_provider_location ON "Provider";
   CREATE TRIGGER trg_provider_location
   BEFORE INSERT OR UPDATE OF latitude, longitude ON "Provider"
   FOR EACH ROW
   EXECUTE FUNCTION sync_provider_location();
   ```

4. **Seed Noida Service Catalog & Admin Account:**
   ```bash
   npm run db:seed
   ```

---

### Step 4: Configure Razorpay Webhooks

1. Open your **Razorpay Dashboard > Settings > Webhooks**.
2. Click **Add New Webhook** and provide:
   - **Webhook URL**: `https://locconnect.in/api/webhooks/razorpay`
   - **Secret**: Copy the value set in `RAZORPAY_WEBHOOK_SECRET`.
   - **Active Events**:
     - `payment.captured`
     - `payment.failed`
     - `refund.processed`
     - `order.paid`
3. Click **Save Webhook**.

---

### Step 5: Deploy to Vercel

1. Import the Git repository into **Vercel**.
2. Select Framework Preset: **Next.js**.
3. In **Build & Development Settings**:
   - **Build Command**: `npx prisma generate && next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. Add all production environment variables configured in Step 2.
5. Click **Deploy**.

---

## 4. Alternative: Docker Container Deployment (Self-Hosted)

For teams self-hosting on AWS EC2, DigitalOcean Droplet, or Kubernetes:

### `Dockerfile`
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:15-3.3-alpine
    restart: always
    environment:
      POSTGRES_USER: locconnect
      POSTGRES_PASSWORD: locconnect_secure_password
      POSTGRES_DB: locconnect_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: "postgresql://locconnect:locconnect_secure_password@db:5432/locconnect_db"
      NEXT_PUBLIC_APP_URL: "http://localhost:3000"
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
```

---

## 5. Post-Deployment Verification Checklist

Once deployed to production, verify every critical path using this checklist:

- [ ] **SSL / DNS**: Ensure `https://locconnect.in` loads with valid HTTPS and canonical redirects.
- [ ] **Health Check API**: Query `GET /api/health` and verify `{"status": "ok"}`.
- [ ] **Catalog Indexing**: Verify `/services/plumber/noida` loads active providers sorted by proximity.
- [ ] **Customer Auth**: Test phone OTP login (`+919876543210`), receive OTP or mock OTP, verify session cookie.
- [ ] **Booking Creation**: Create a booking for *Water Purifier Repair* at Sector 62, Noida.
- [ ] **Escrow Payment**: Execute test payment via Razorpay checkout, verify webhook fires `payment.captured`, booking status advances to `CONFIRMED`.
- [ ] **Provider Portal**: Log in as Ramesh Verma (`+919876543211`), view job request in `/provider/jobs`, accept job, and verify status updates to `IN_PROGRESS`.
- [ ] **Completion & Payout Calculation**: Complete job, verify platform fee (15%), GST (18% of platform fee), and provider net payout (85%) recorded in `/provider/payouts`.
- [ ] **Review & Rating**: Post a 5-star customer review on `/bookings/[id]`, confirm provider score recalculates accurately.
- [ ] **Admin Control Tower**: Log in as admin (`+919876543299`), review KPIs on `/admin`, inspect KYC queue in `/admin/verification`, and test booking dispute arbitration.
