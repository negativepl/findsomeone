-- =====================================================
-- BOOKING SYSTEM MIGRATION
-- =====================================================
-- Adds booking/reservation system for service providers
-- Allows users to offer services and clients to book appointments

-- =====================================================
-- 1. ADD is_service COLUMN TO posts
-- =====================================================
-- Distinguishes service posts (e.g., plumber) from sale posts (e.g., phone)

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS is_service BOOLEAN DEFAULT false;

-- Add index for filtering service posts
CREATE INDEX IF NOT EXISTS posts_is_service_idx ON posts(is_service) WHERE is_service = true;

COMMENT ON COLUMN posts.is_service IS 'True if this is a service post (allows bookings), false for sale posts';

-- =====================================================
-- 2. PROVIDER SETTINGS TABLE
-- =====================================================
-- Global settings for service providers

CREATE TABLE IF NOT EXISTS provider_settings (
  provider_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Booking configuration
  booking_enabled BOOLEAN DEFAULT true,
  default_duration_minutes INTEGER DEFAULT 60 CHECK (default_duration_minutes > 0),
  buffer_time_minutes INTEGER DEFAULT 0 CHECK (buffer_time_minutes >= 0),
  advance_booking_days INTEGER DEFAULT 30 CHECK (advance_booking_days > 0),

  -- Confirmation settings
  require_confirmation BOOLEAN DEFAULT true,
  auto_confirm BOOLEAN DEFAULT false,

  -- Pricing
  price_per_hour NUMERIC(10, 2),
  currency VARCHAR(3) DEFAULT 'PLN',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for provider_settings
ALTER TABLE provider_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own provider settings"
  ON provider_settings FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Users can update their own provider settings"
  ON provider_settings FOR UPDATE
  USING (auth.uid() = provider_id);

CREATE POLICY "Users can insert their own provider settings"
  ON provider_settings FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

-- =====================================================
-- 3. PROVIDER AVAILABILITY TABLE
-- =====================================================
-- Weekly recurring availability schedule

CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),

  -- Time range
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT unique_provider_day_time UNIQUE (provider_id, day_of_week, start_time, end_time)
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS provider_availability_provider_idx ON provider_availability(provider_id);

-- RLS Policies
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view provider availability"
  ON provider_availability FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage their own availability"
  ON provider_availability FOR ALL
  USING (auth.uid() = provider_id);

-- =====================================================
-- 4. PROVIDER BLOCKED DATES TABLE
-- =====================================================
-- Specific dates when provider is unavailable (vacations, holidays, etc.)

CREATE TABLE IF NOT EXISTS provider_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  blocked_date DATE NOT NULL,
  reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_provider_blocked_date UNIQUE (provider_id, blocked_date)
);

-- Index for efficient date range queries
CREATE INDEX IF NOT EXISTS provider_blocked_dates_provider_date_idx
  ON provider_blocked_dates(provider_id, blocked_date);

-- RLS Policies
ALTER TABLE provider_blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blocked dates"
  ON provider_blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage their own blocked dates"
  ON provider_blocked_dates FOR ALL
  USING (auth.uid() = provider_id);

-- =====================================================
-- 5. BOOKINGS TABLE
-- =====================================================
-- Client appointments/reservations with service providers

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),

  -- Status workflow: pending → confirmed → completed → reviewed
  -- Can also go to: cancelled
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'reviewed')),

  -- Details
  service_description TEXT,
  client_notes TEXT,
  provider_notes TEXT,

  -- Pricing
  price NUMERIC(10, 2),

  -- Cancellation tracking
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id),
  cancelled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT different_users CHECK (provider_id != client_id),
  CONSTRAINT valid_scheduled_time CHECK (scheduled_at > created_at)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS bookings_provider_idx ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS bookings_client_idx ON bookings(client_id);
CREATE INDEX IF NOT EXISTS bookings_post_idx ON bookings(post_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
CREATE INDEX IF NOT EXISTS bookings_scheduled_at_idx ON bookings(scheduled_at);

-- Composite index for provider's calendar view
CREATE INDEX IF NOT EXISTS bookings_provider_scheduled_idx
  ON bookings(provider_id, scheduled_at)
  WHERE status IN ('pending', 'confirmed');

-- RLS Policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = provider_id OR auth.uid() = client_id);

CREATE POLICY "Clients can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Providers and clients can update their bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = provider_id OR auth.uid() = client_id);

-- =====================================================
-- 6. ADD booking_id TO reviews TABLE
-- =====================================================
-- Link reviews to specific bookings instead of just posts

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;

-- Index for efficient lookup
CREATE INDEX IF NOT EXISTS reviews_booking_idx ON reviews(booking_id);

-- Update the unique constraint to include booking_id
-- First drop the old constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_reviewed_id_post_id_key;

-- Add new constraint allowing one review per booking OR one review per post (for old system)
-- Users can review either via booking_id OR via post_id (legacy), but not both for same combination
CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_booking
  ON reviews(reviewer_id, reviewed_id, booking_id)
  WHERE booking_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_post_legacy
  ON reviews(reviewer_id, reviewed_id, post_id)
  WHERE booking_id IS NULL AND post_id IS NOT NULL;

COMMENT ON COLUMN reviews.booking_id IS 'Optional: links review to specific booking (new system)';

-- =====================================================
-- 7. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for provider_settings
DROP TRIGGER IF EXISTS update_provider_settings_updated_at ON provider_settings;
CREATE TRIGGER update_provider_settings_updated_at
  BEFORE UPDATE ON provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to prevent double-booking (overlapping appointments)
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for confirmed or pending bookings
  IF NEW.status IN ('pending', 'confirmed') THEN
    -- Check if there's an overlapping booking for the same provider
    IF EXISTS (
      SELECT 1 FROM bookings
      WHERE provider_id = NEW.provider_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status IN ('pending', 'confirmed')
        AND (
          -- New booking starts during existing booking
          (NEW.scheduled_at >= scheduled_at
           AND NEW.scheduled_at < scheduled_at + (duration_minutes || ' minutes')::interval)
          OR
          -- New booking ends during existing booking
          (NEW.scheduled_at + (NEW.duration_minutes || ' minutes')::interval > scheduled_at
           AND NEW.scheduled_at + (NEW.duration_minutes || ' minutes')::interval <= scheduled_at + (duration_minutes || ' minutes')::interval)
          OR
          -- New booking completely encompasses existing booking
          (NEW.scheduled_at <= scheduled_at
           AND NEW.scheduled_at + (NEW.duration_minutes || ' minutes')::interval >= scheduled_at + (duration_minutes || ' minutes')::interval)
        )
    ) THEN
      RAISE EXCEPTION 'Ten termin jest już zajęty. Wybierz inny termin.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent double-booking
DROP TRIGGER IF EXISTS check_double_booking ON bookings;
CREATE TRIGGER check_double_booking
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_double_booking();

-- Function to automatically create default availability when provider_settings is created
CREATE OR REPLACE FUNCTION create_default_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Create Mon-Fri 9:00-17:00 availability
  INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time, is_available)
  VALUES
    (NEW.provider_id, 1, '09:00', '17:00', true), -- Monday
    (NEW.provider_id, 2, '09:00', '17:00', true), -- Tuesday
    (NEW.provider_id, 3, '09:00', '17:00', true), -- Wednesday
    (NEW.provider_id, 4, '09:00', '17:00', true), -- Thursday
    (NEW.provider_id, 5, '09:00', '17:00', true)  -- Friday
  ON CONFLICT (provider_id, day_of_week, start_time, end_time) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default availability
DROP TRIGGER IF EXISTS create_default_availability_trigger ON provider_settings;
CREATE TRIGGER create_default_availability_trigger
  AFTER INSERT ON provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION create_default_availability();
