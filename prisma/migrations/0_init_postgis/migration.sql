-- ==============================================================================
-- LocConnect Migration: PostGIS Setup, Spatial Geography & Helper Functions
-- ==============================================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Add Geography Point Columns (WGS 84 / SRID 4326)
ALTER TABLE IF EXISTS "providers" 
  ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);

ALTER TABLE IF EXISTS "addresses" 
  ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);

-- 3. Automatic Synchronization Triggers for Providers Location
CREATE OR REPLACE FUNCTION update_provider_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_provider_location ON "providers";
CREATE TRIGGER trigger_update_provider_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON "providers"
FOR EACH ROW EXECUTE FUNCTION update_provider_location();

-- 4. Automatic Synchronization Triggers for Addresses Location
CREATE OR REPLACE FUNCTION update_address_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_address_location ON "addresses";
CREATE TRIGGER trigger_update_address_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON "addresses"
FOR EACH ROW EXECUTE FUNCTION update_address_location();

-- 5. Spatial GIST Indexes
CREATE INDEX IF NOT EXISTS "providers_location_gist" 
  ON "providers" USING GIST ("location");

CREATE INDEX IF NOT EXISTS "addresses_location_gist" 
  ON "addresses" USING GIST ("location");

-- 6. High-Performance Geospatial Provider Discovery Function
CREATE OR REPLACE FUNCTION find_providers_within_radius(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 15000,
  category_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  provider_id TEXT,
  user_id TEXT,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  experience_years INT,
  average_rating DOUBLE PRECISION,
  total_reviews INT,
  distance_meters DOUBLE PRECISION,
  current_address TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS provider_id,
    p.user_id,
    prof.name,
    prof.avatar_url,
    u.phone,
    p.experience_years,
    p.average_rating,
    p.total_reviews,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_meters,
    p.current_address
  FROM providers p
  JOIN users u ON u.id = p.user_id
  JOIN profiles prof ON prof.user_id = u.id
  WHERE p.verification_status = 'VERIFIED'
    AND p.is_available = true
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      LEAST(p.service_radius_km * 1000, radius_meters)
    )
    AND (
      category_slug IS NULL OR EXISTS (
        SELECT 1 FROM provider_services ps
        JOIN services s ON s.id = ps.service_id
        JOIN categories c ON c.id = s.category_id
        WHERE ps.provider_id = p.id
          AND c.slug = category_slug
          AND ps.is_available = true
      )
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
