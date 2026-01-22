-- ============================================
-- I'm Okay - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('guardian', 'dependent')),
  display_name TEXT,
  avatar_url TEXT,
  push_token TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guardian-Dependent relationships
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dependent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-in schedules
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE NOT NULL,
  start_time TIME NOT NULL,          -- e.g., 09:00
  end_time TIME NOT NULL,            -- e.g., 10:00 (1hr window)
  days_of_week INT[] NOT NULL,       -- [1,2,3,4,5] = Mon-Fri
  reminder_minutes INT DEFAULT 15,   -- Minutes before end_time to remind
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-in records
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dependent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'help_requested'))
);

-- Subscriptions (for freemium)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'family')),
  revenuecat_customer_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Relationships indexes
CREATE INDEX IF NOT EXISTS idx_relationships_guardian_id ON relationships(guardian_id);
CREATE INDEX IF NOT EXISTS idx_relationships_dependent_id ON relationships(dependent_id);
CREATE INDEX IF NOT EXISTS idx_relationships_invite_code ON relationships(invite_code);
CREATE INDEX IF NOT EXISTS idx_relationships_status ON relationships(status);

-- Schedules indexes
CREATE INDEX IF NOT EXISTS idx_schedules_relationship_id ON schedules(relationship_id);
CREATE INDEX IF NOT EXISTS idx_schedules_is_active ON schedules(is_active);

-- Checkins indexes
CREATE INDEX IF NOT EXISTS idx_checkins_dependent_id ON checkins(dependent_id);
CREATE INDEX IF NOT EXISTS idx_checkins_schedule_id ON checkins(schedule_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON checkins(checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_status ON checkins(status);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: Profiles
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Guardians can view their dependents' profiles
CREATE POLICY "Guardians can view dependent profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT dependent_id FROM relationships 
      WHERE guardian_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Dependents can view their guardians' profiles
CREATE POLICY "Dependents can view guardian profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT guardian_id FROM relationships 
      WHERE dependent_id = auth.uid() 
      AND status = 'active'
    )
  );

-- ============================================
-- RLS POLICIES: Relationships
-- ============================================

-- Guardians can view their relationships
CREATE POLICY "Guardians can view own relationships"
  ON relationships FOR SELECT
  USING (guardian_id = auth.uid());

-- Dependents can view their relationships
CREATE POLICY "Dependents can view own relationships"
  ON relationships FOR SELECT
  USING (dependent_id = auth.uid());

-- Guardians can create relationships (with invite codes)
CREATE POLICY "Guardians can create relationships"
  ON relationships FOR INSERT
  WITH CHECK (guardian_id = auth.uid());

-- Dependents can update relationships (accept invite)
CREATE POLICY "Dependents can accept invites"
  ON relationships FOR UPDATE
  USING (
    invite_code IS NOT NULL 
    AND dependent_id IS NULL
  );

-- Guardians can update their relationships
CREATE POLICY "Guardians can update own relationships"
  ON relationships FOR UPDATE
  USING (guardian_id = auth.uid());

-- Guardians can delete their relationships
CREATE POLICY "Guardians can delete own relationships"
  ON relationships FOR DELETE
  USING (guardian_id = auth.uid());

-- ============================================
-- RLS POLICIES: Schedules
-- ============================================

-- Guardians can view schedules for their relationships
CREATE POLICY "Guardians can view schedules"
  ON schedules FOR SELECT
  USING (
    relationship_id IN (
      SELECT id FROM relationships 
      WHERE guardian_id = auth.uid()
    )
  );

-- Dependents can view their schedules
CREATE POLICY "Dependents can view own schedules"
  ON schedules FOR SELECT
  USING (
    relationship_id IN (
      SELECT id FROM relationships 
      WHERE dependent_id = auth.uid()
    )
  );

-- Guardians can create schedules
CREATE POLICY "Guardians can create schedules"
  ON schedules FOR INSERT
  WITH CHECK (
    relationship_id IN (
      SELECT id FROM relationships 
      WHERE guardian_id = auth.uid()
    )
  );

-- Guardians can update schedules
CREATE POLICY "Guardians can update schedules"
  ON schedules FOR UPDATE
  USING (
    relationship_id IN (
      SELECT id FROM relationships 
      WHERE guardian_id = auth.uid()
    )
  );

-- Guardians can delete schedules
CREATE POLICY "Guardians can delete schedules"
  ON schedules FOR DELETE
  USING (
    relationship_id IN (
      SELECT id FROM relationships 
      WHERE guardian_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES: Check-ins
-- ============================================

-- Dependents can create their own check-ins
CREATE POLICY "Dependents can create check-ins"
  ON checkins FOR INSERT
  WITH CHECK (dependent_id = auth.uid());

-- Dependents can view their own check-ins
CREATE POLICY "Dependents can view own check-ins"
  ON checkins FOR SELECT
  USING (dependent_id = auth.uid());

-- Guardians can view their dependents' check-ins
CREATE POLICY "Guardians can view dependent check-ins"
  ON checkins FOR SELECT
  USING (
    dependent_id IN (
      SELECT dependent_id FROM relationships 
      WHERE guardian_id = auth.uid() 
      AND status = 'active'
    )
  );

-- ============================================
-- RLS POLICIES: Subscriptions
-- ============================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own subscription (for free tier creation)
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Auto-create free subscription on profile role set
-- ============================================

-- Function to handle profile role being set
CREATE OR REPLACE FUNCTION public.handle_profile_role_set()
RETURNS TRIGGER AS $$
BEGIN
  -- Create free subscription if role is set and subscription doesn't exist
  IF NEW.role IS NOT NULL AND OLD.role IS NULL THEN
    INSERT INTO public.subscriptions (user_id, tier)
    VALUES (NEW.id, 'free')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create subscription when profile role is set
DROP TRIGGER IF EXISTS on_profile_role_set ON profiles;
CREATE TRIGGER on_profile_role_set
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_role_set();

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE relationships IS 'Guardian-dependent relationships with invite codes';
COMMENT ON TABLE schedules IS 'Check-in schedules for each guardian-dependent relationship';
COMMENT ON TABLE checkins IS 'Individual check-in records from dependents';
COMMENT ON TABLE subscriptions IS 'User subscription tiers for freemium model';

COMMENT ON COLUMN profiles.role IS 'User role: guardian or dependent';
COMMENT ON COLUMN profiles.push_token IS 'Expo push notification token';
COMMENT ON COLUMN relationships.invite_code IS '6-character code for dependent to join';
COMMENT ON COLUMN relationships.status IS 'Relationship status: pending, active, or removed';
COMMENT ON COLUMN schedules.days_of_week IS 'Days of week (1=Mon, 7=Sun) when check-in is required';
COMMENT ON COLUMN checkins.status IS 'Check-in status: completed, missed, or help_requested';
