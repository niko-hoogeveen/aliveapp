-- ============================================
-- I'm Okay App - Initial Database Schema
-- ============================================
-- This migration creates all tables, indexes, RLS policies,
-- and triggers for the I'm Okay safety check-in app.
-- ============================================

-- ============================================
-- 1. TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('guardian', 'dependent')),
  display_name TEXT,
  avatar_url TEXT,
  push_token TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN profiles.role IS 'User role: guardian or dependent';
COMMENT ON COLUMN profiles.push_token IS 'Expo push notification token';

-- Guardian-Dependent relationships
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dependent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE relationships IS 'Guardian-Dependent relationships with invite codes';
COMMENT ON COLUMN relationships.invite_code IS '6-character alphanumeric code for joining';
COMMENT ON COLUMN relationships.status IS 'pending (invite created), active (accepted), removed';

-- Check-in schedules
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INT[] NOT NULL,
  reminder_minutes INT DEFAULT 15,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE schedules IS 'Check-in schedules for each relationship';
COMMENT ON COLUMN schedules.days_of_week IS 'Array of days: 1=Monday through 7=Sunday';
COMMENT ON COLUMN schedules.reminder_minutes IS 'Minutes before deadline to send reminder';

-- Check-in records
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dependent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'missed', 'help_requested')) NOT NULL
);

COMMENT ON TABLE checkins IS 'Individual check-in records';
COMMENT ON COLUMN checkins.status IS 'completed (checked in), missed (window passed), help_requested';

-- Subscriptions (for freemium model)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'family')) NOT NULL,
  revenuecat_customer_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE subscriptions IS 'User subscription tiers for freemium model';
COMMENT ON COLUMN subscriptions.tier IS 'free, premium ($4.99/mo), or family ($7.99/mo)';

-- ============================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_checkins_dependent ON checkins(dependent_id);
CREATE INDEX IF NOT EXISTS idx_checkins_schedule ON checkins(schedule_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON checkins(checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_relationships_guardian ON relationships(guardian_id);
CREATE INDEX IF NOT EXISTS idx_relationships_dependent ON relationships(dependent_id);
CREATE INDEX IF NOT EXISTS idx_relationships_invite_code ON relationships(invite_code);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Guardians can view profiles of their active dependents
CREATE POLICY "Guardians can view dependent profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM relationships
      WHERE relationships.guardian_id = auth.uid()
      AND relationships.dependent_id = profiles.id
      AND relationships.status = 'active'
    )
  );

-- Dependents can view profiles of their active guardians
CREATE POLICY "Dependents can view guardian profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM relationships
      WHERE relationships.dependent_id = auth.uid()
      AND relationships.guardian_id = profiles.id
      AND relationships.status = 'active'
    )
  );

-- ----------------------------------------
-- RELATIONSHIPS POLICIES
-- ----------------------------------------

-- Guardians can view their own relationships
CREATE POLICY "Guardians can view their relationships" ON relationships
  FOR SELECT USING (auth.uid() = guardian_id);

-- Dependents can view their own relationships
CREATE POLICY "Dependents can view their relationships" ON relationships
  FOR SELECT USING (auth.uid() = dependent_id);

-- Guardians can create relationships (invites)
CREATE POLICY "Guardians can create relationships" ON relationships
  FOR INSERT WITH CHECK (auth.uid() = guardian_id);

-- Guardians can update their relationships (confirm, remove)
CREATE POLICY "Guardians can update their relationships" ON relationships
  FOR UPDATE USING (auth.uid() = guardian_id);

-- Dependents can update relationships to join (claim invite code)
CREATE POLICY "Dependents can join via invite code" ON relationships
  FOR UPDATE USING (
    invite_code IS NOT NULL 
    AND dependent_id IS NULL
    AND status = 'pending'
  );

-- ----------------------------------------
-- SCHEDULES POLICIES
-- ----------------------------------------

-- Guardians can view schedules for their relationships
CREATE POLICY "Guardians can view schedules" ON schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM relationships
      WHERE relationships.id = schedules.relationship_id
      AND relationships.guardian_id = auth.uid()
    )
  );

-- Dependents can view their own schedules
CREATE POLICY "Dependents can view their schedules" ON schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM relationships
      WHERE relationships.id = schedules.relationship_id
      AND relationships.dependent_id = auth.uid()
    )
  );

-- Guardians can create schedules for their relationships
CREATE POLICY "Guardians can create schedules" ON schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM relationships
      WHERE relationships.id = schedules.relationship_id
      AND relationships.guardian_id = auth.uid()
      AND relationships.status = 'active'
    )
  );

-- Guardians can update schedules for their relationships
CREATE POLICY "Guardians can update schedules" ON schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM relationships
      WHERE relationships.id = schedules.relationship_id
      AND relationships.guardian_id = auth.uid()
    )
  );

-- Guardians can delete schedules for their relationships
CREATE POLICY "Guardians can delete schedules" ON schedules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM relationships
      WHERE relationships.id = schedules.relationship_id
      AND relationships.guardian_id = auth.uid()
    )
  );

-- ----------------------------------------
-- CHECKINS POLICIES
-- ----------------------------------------

-- Dependents can create their own check-ins
CREATE POLICY "Dependents can create check-ins" ON checkins
  FOR INSERT WITH CHECK (auth.uid() = dependent_id);

-- Dependents can view their own check-ins
CREATE POLICY "Dependents can view own check-ins" ON checkins
  FOR SELECT USING (auth.uid() = dependent_id);

-- Guardians can view check-ins of their active dependents
CREATE POLICY "Guardians can view dependent check-ins" ON checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM relationships
      WHERE relationships.guardian_id = auth.uid()
      AND relationships.dependent_id = checkins.dependent_id
      AND relationships.status = 'active'
    )
  );

-- ----------------------------------------
-- SUBSCRIPTIONS POLICIES
-- ----------------------------------------

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 4. TRIGGER: Auto-create profile on signup
-- ============================================

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  
  -- Also create a free subscription for the user
  INSERT INTO public.subscriptions (user_id, tier, created_at)
  VALUES (NEW.id, 'free', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. HELPER FUNCTION: Generate invite code
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;
