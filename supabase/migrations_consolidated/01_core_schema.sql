-- =====================================================
-- 01_CORE_SCHEMA.SQL
-- Core database schema for FindSomeone platform
-- =====================================================
-- This file contains the fundamental tables and structures
-- for the platform including users, posts, categories,
-- messages, reviews, and core functionality.
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable trigram similarity search (for fuzzy text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- CITIES TABLE
-- =====================================================
-- Polish cities and towns data for location filtering

CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  voivodeship TEXT, -- województwo
  county TEXT, -- powiat
  population INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities (slug);
CREATE INDEX IF NOT EXISTS idx_cities_voivodeship ON public.cities (voivodeship);
CREATE INDEX IF NOT EXISTS idx_cities_popular ON public.cities (popular) WHERE popular = true;

COMMENT ON TABLE public.cities IS 'Polish cities and towns data from GUS';

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
-- Service categories with hierarchical structure

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Lucide icon name
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(parent_id, display_order);

COMMENT ON COLUMN categories.display_order IS 'Order for displaying categories. 9999 = last (for Pozostałe/Inne categories)';

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- User profiles extending Supabase auth.users

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  city TEXT,
  rating NUMERIC(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),

  -- User preferences
  email_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  language VARCHAR(10) DEFAULT 'pl',
  theme VARCHAR(20) DEFAULT 'light',

  -- Profile banner
  banner_url TEXT,
  banner_position TEXT DEFAULT 'center',
  banner_scale NUMERIC(3, 2) DEFAULT 1.0,

  -- User badges
  badges TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
CREATE INDEX IF NOT EXISTS idx_profiles_preferences ON profiles(email_notifications, message_notifications);

-- =====================================================
-- POSTS TABLE
-- =====================================================
-- Main posts/listings table

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,

  -- Price fields
  price NUMERIC(10, 2),
  price_type TEXT NOT NULL DEFAULT 'negotiable' CHECK (price_type IN ('hourly', 'fixed', 'negotiable', 'free')),
  price_negotiable BOOLEAN DEFAULT FALSE,

  images TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'completed')),
  views INTEGER DEFAULT 0,
  phone_clicks INTEGER DEFAULT 0,

  -- Moderation fields
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'checking', 'approved', 'rejected', 'flagged')),
  moderation_score DECIMAL(5,2),
  moderation_reason TEXT,
  moderation_details JSONB,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES auth.users(id),

  -- Post expiration
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '30 days'),
  extended_count INTEGER DEFAULT 0,
  last_extended_at TIMESTAMP WITH TIME ZONE,
  expiration_notified_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  is_deleted BOOLEAN DEFAULT false NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON posts(category_id);
CREATE INDEX IF NOT EXISTS posts_city_idx ON posts(city);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_moderation_status ON posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_posts_moderated_at ON posts(moderated_at);
CREATE INDEX IF NOT EXISTS posts_expires_at_idx ON posts(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS posts_expiration_notification_idx ON posts(expires_at, expiration_notified_at)
  WHERE status = 'active' AND expiration_notified_at IS NULL;

COMMENT ON COLUMN posts.expires_at IS 'Date when the post will automatically expire';
COMMENT ON COLUMN posts.extended_count IS 'Number of times the post expiration has been extended';
COMMENT ON COLUMN posts.last_extended_at IS 'Last time the expiration was extended';
COMMENT ON COLUMN posts.expiration_notified_at IS 'Last time user was notified about upcoming expiration';

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
-- Private messaging between users

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_post_id_idx ON messages(post_id);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
-- User ratings and reviews

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(reviewer_id, reviewed_id, post_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS reviews_reviewed_id_idx ON reviews(reviewed_id);

-- =====================================================
-- SAVED POSTS / FAVORITES TABLE
-- =====================================================
-- User's saved/favorited posts

CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS saved_posts_user_id_idx ON saved_posts(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - CITIES
-- =====================================================

CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  USING (true);

-- =====================================================
-- RLS POLICIES - CATEGORIES
-- =====================================================

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- =====================================================
-- RLS POLICIES - PROFILES
-- =====================================================

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- RLS POLICIES - POSTS
-- =====================================================

CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (
    auth.uid() = user_id
    OR moderation_status = 'approved'
  );

CREATE POLICY "Admins can view all posts"
  ON posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - MESSAGES
-- =====================================================

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- =====================================================
-- RLS POLICIES - REVIEWS
-- =====================================================

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- =====================================================
-- RLS POLICIES - SAVED POSTS
-- =====================================================

CREATE POLICY "Users can view own saved posts"
  ON saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved posts"
  ON saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update profile rating
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE reviewed_id = NEW.reviewed_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewed_id = NEW.reviewed_id
    )
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating on new review
DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE PROCEDURE update_profile_rating();

-- Function to increment phone clicks on posts
CREATE OR REPLACE FUNCTION increment_phone_clicks(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET phone_clicks = phone_clicks + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_phone_clicks(UUID) TO authenticated, anon;

-- Function to auto-expire old posts
CREATE OR REPLACE FUNCTION expire_old_posts()
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET status = 'closed',
      updated_at = timezone('utc'::text, now())
  WHERE status = 'active'
    AND expires_at < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to extend post expiration (30 days from now)
CREATE OR REPLACE FUNCTION extend_post_expiration(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET expires_at = timezone('utc'::text, now()) + interval '30 days',
      extended_count = extended_count + 1,
      last_extended_at = timezone('utc'::text, now()),
      expiration_notified_at = NULL,
      updated_at = timezone('utc'::text, now())
  WHERE id = post_id
    AND user_id = auth.uid()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get posts expiring soon (for notifications)
CREATE OR REPLACE FUNCTION get_posts_expiring_soon(days_before INTEGER)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  user_email TEXT,
  user_full_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.title,
    p.expires_at,
    pr.email,
    pr.full_name
  FROM posts p
  JOIN profiles pr ON p.user_id = pr.id
  WHERE p.status = 'active'
    AND p.expires_at <= timezone('utc'::text, now()) + make_interval(days => days_before)
    AND p.expires_at > timezone('utc'::text, now())
    AND (
      p.expiration_notified_at IS NULL
      OR p.expiration_notified_at < timezone('utc'::text, now()) - interval '1 day'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON posts TO authenticated, anon;
GRANT SELECT ON profiles TO authenticated, anon;
GRANT SELECT ON categories TO authenticated, anon;
GRANT SELECT ON cities TO authenticated, anon;
