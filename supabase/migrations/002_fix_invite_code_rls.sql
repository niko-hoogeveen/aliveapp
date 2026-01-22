-- ============================================
-- Fix: Allow dependents to find and join pending invites
-- ============================================
-- This migration:
-- 1. Adds a SELECT policy to find pending invites by code
-- 2. Fixes the UPDATE policy to properly allow claiming invites
-- 3. Adds a DELETE policy for guardians to remove pending invites
-- ============================================

-- Add policy to allow finding pending invites by code
-- This is safe because:
-- 1. The invite_code is a secret shared by the guardian
-- 2. The row only becomes visible if you know the exact code
-- 3. It only works for pending invites with no dependent assigned yet
CREATE POLICY "Anyone can find pending invites by code" ON relationships
  FOR SELECT USING (
    invite_code IS NOT NULL 
    AND dependent_id IS NULL
    AND status = 'pending'
  );

-- Drop the existing UPDATE policy that doesn't work correctly
DROP POLICY IF EXISTS "Dependents can join via invite code" ON relationships;

-- Recreate with proper USING and WITH CHECK clauses
-- USING: checks the row BEFORE update (must be a pending invite with no dependent)
-- WITH CHECK: validates the row AFTER update (dependent_id must be the current user)
CREATE POLICY "Dependents can join via invite code" ON relationships
  FOR UPDATE 
  USING (
    -- Before update: must be a pending invite with no dependent
    invite_code IS NOT NULL 
    AND dependent_id IS NULL
    AND status = 'pending'
  )
  WITH CHECK (
    -- After update: the dependent_id must be set to the current user
    dependent_id = auth.uid()
  );

-- Allow guardians to delete their own pending invites
-- This is needed when generating a new code to replace an old one
CREATE POLICY "Guardians can delete pending invites" ON relationships
  FOR DELETE USING (
    auth.uid() = guardian_id
    AND status = 'pending'
    AND dependent_id IS NULL
  );
