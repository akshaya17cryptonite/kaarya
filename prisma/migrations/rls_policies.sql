-- ==============================================================================
-- LocConnect Migration: Supabase Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable Row Level Security on all core tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "providers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "provider_services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "availability_slots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kyc_documents" ENABLE ROW LEVEL SECURITY;

-- Helper to check if current request is from an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "users"
    WHERE auth_id = auth.uid()::text AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 1. USERS & PROFILES
-- -----------------------------------------------------------------------------
-- Users can view their own record or Admins can view all
DROP POLICY IF EXISTS "Users can read own row or admin" ON "users";
CREATE POLICY "Users can read own row or admin" ON "users"
  FOR SELECT USING (auth_id = auth.uid()::text OR is_admin());

-- Profiles: Publicly readable for marketplace browsing
DROP POLICY IF EXISTS "Public can view profiles" ON "profiles";
CREATE POLICY "Public can view profiles" ON "profiles"
  FOR SELECT USING (true);

-- Users can update only their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON "profiles";
CREATE POLICY "Users can update own profile" ON "profiles"
  FOR UPDATE USING (
    user_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
  );

-- -----------------------------------------------------------------------------
-- 2. PROVIDERS
-- -----------------------------------------------------------------------------
-- Anyone can view verified providers
DROP POLICY IF EXISTS "Public can view verified providers" ON "providers";
CREATE POLICY "Public can view verified providers" ON "providers"
  FOR SELECT USING (verification_status = 'VERIFIED' OR is_admin());

-- Provider can view & update their own record
DROP POLICY IF EXISTS "Providers can manage own record" ON "providers";
CREATE POLICY "Providers can manage own record" ON "providers"
  FOR ALL USING (
    user_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
  );

-- -----------------------------------------------------------------------------
-- 3. CATALOG (CATEGORIES & SERVICES)
-- -----------------------------------------------------------------------------
-- Public can view active categories and services
DROP POLICY IF EXISTS "Public can view active categories" ON "categories";
CREATE POLICY "Public can view active categories" ON "categories"
  FOR SELECT USING (is_active = true OR is_admin());

DROP POLICY IF EXISTS "Public can view active services" ON "services";
CREATE POLICY "Public can view active services" ON "services"
  FOR SELECT USING (is_active = true OR is_admin());

-- Admin can manage categories and services
DROP POLICY IF EXISTS "Admin manage categories" ON "categories";
CREATE POLICY "Admin manage categories" ON "categories"
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admin manage services" ON "services";
CREATE POLICY "Admin manage services" ON "services"
  FOR ALL USING (is_admin());

-- -----------------------------------------------------------------------------
-- 4. PROVIDER SERVICES & AVAILABILITY
-- -----------------------------------------------------------------------------
-- Public can view active provider services
DROP POLICY IF EXISTS "Public can view provider services" ON "provider_services";
CREATE POLICY "Public can view provider services" ON "provider_services"
  FOR SELECT USING (is_available = true OR is_admin());

-- Provider can manage own services
DROP POLICY IF EXISTS "Providers can manage own services" ON "provider_services";
CREATE POLICY "Providers can manage own services" ON "provider_services"
  FOR ALL USING (
    provider_id IN (
      SELECT p.id FROM "providers" p 
      JOIN "users" u ON u.id = p.user_id 
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- Public can view availability slots
DROP POLICY IF EXISTS "Public can view availability slots" ON "availability_slots";
CREATE POLICY "Public can view availability slots" ON "availability_slots"
  FOR SELECT USING (true);

-- Provider can manage availability slots
DROP POLICY IF EXISTS "Providers can manage slots" ON "availability_slots";
CREATE POLICY "Providers can manage slots" ON "availability_slots"
  FOR ALL USING (
    provider_id IN (
      SELECT p.id FROM "providers" p 
      JOIN "users" u ON u.id = p.user_id 
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- -----------------------------------------------------------------------------
-- 5. ADDRESSES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own addresses" ON "addresses";
CREATE POLICY "Users can manage own addresses" ON "addresses"
  FOR ALL USING (
    user_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
  );

-- -----------------------------------------------------------------------------
-- 6. BOOKINGS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customers and providers can view their bookings" ON "bookings";
CREATE POLICY "Customers and providers can view their bookings" ON "bookings"
  FOR SELECT USING (
    customer_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
    OR provider_id IN (
      SELECT p.id FROM "providers" p 
      JOIN "users" u ON u.id = p.user_id 
      WHERE u.auth_id = auth.uid()::text
    )
    OR is_admin()
  );

-- Customers can insert bookings
DROP POLICY IF EXISTS "Customers can create bookings" ON "bookings";
CREATE POLICY "Customers can create bookings" ON "bookings"
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
  );

-- Customers and providers can update relevant bookings
DROP POLICY IF EXISTS "Parties can update their bookings" ON "bookings";
CREATE POLICY "Parties can update their bookings" ON "bookings"
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
    OR provider_id IN (
      SELECT p.id FROM "providers" p 
      JOIN "users" u ON u.id = p.user_id 
      WHERE u.auth_id = auth.uid()::text
    )
    OR is_admin()
  );

-- -----------------------------------------------------------------------------
-- 7. REVIEWS
-- -----------------------------------------------------------------------------
-- Anyone can view reviews
DROP POLICY IF EXISTS "Public can view reviews" ON "reviews";
CREATE POLICY "Public can view reviews" ON "reviews"
  FOR SELECT USING (true);

-- Customer can create a review for completed booking
DROP POLICY IF EXISTS "Customers can create reviews" ON "reviews";
CREATE POLICY "Customers can create reviews" ON "reviews"
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
  );

-- -----------------------------------------------------------------------------
-- 8. KYC DOCUMENTS
-- -----------------------------------------------------------------------------
-- Only the provider or admin can view KYC documents
DROP POLICY IF EXISTS "Provider or admin view KYC" ON "kyc_documents";
CREATE POLICY "Provider or admin view KYC" ON "kyc_documents"
  FOR SELECT USING (
    provider_id IN (
      SELECT p.id FROM "providers" p 
      JOIN "users" u ON u.id = p.user_id 
      WHERE u.auth_id = auth.uid()::text
    )
    OR is_admin()
  );

-- Provider can insert KYC documents
DROP POLICY IF EXISTS "Provider insert KYC" ON "kyc_documents";
CREATE POLICY "Provider insert KYC" ON "kyc_documents"
  FOR INSERT WITH CHECK (
    provider_id IN (
      SELECT p.id FROM "providers" p 
      JOIN "users" u ON u.id = p.user_id 
      WHERE u.auth_id = auth.uid()::text
    )
  );

-- -----------------------------------------------------------------------------
-- 9. MESSAGES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Participants can view and send messages" ON "messages";
CREATE POLICY "Participants can view and send messages" ON "messages"
  FOR ALL USING (
    sender_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
    OR receiver_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
    OR is_admin()
  );

-- -----------------------------------------------------------------------------
-- 10. NOTIFICATIONS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view and update their own notifications" ON "notifications";
CREATE POLICY "Users can view and update their own notifications" ON "notifications"
  FOR ALL USING (
    user_id IN (SELECT id FROM "users" WHERE auth_id = auth.uid()::text)
  );
