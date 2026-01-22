/**
 * useDependents Hook
 * 
 * Provides guardian access to their dependents' data.
 * Includes relationships, profiles, and latest check-ins.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Relationship = Database['public']['Tables']['relationships']['Row'];
type Checkin = Database['public']['Tables']['checkins']['Row'];

export interface DependentData {
  relationship: Relationship;
  profile: Profile | null;
  lastCheckIn: Checkin | null;
  status: 'ok' | 'pending' | 'missed' | 'unknown';
}

interface UseDependentsResult {
  /** List of dependents with their data */
  dependents: DependentData[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh dependents data */
  refreshDependents: () => Promise<void>;
  /** Status counts */
  statusCounts: {
    ok: number;
    pending: number;
    missed: number;
  };
}

/**
 * Determine the status of a dependent based on their last check-in
 */
function calculateStatus(lastCheckIn: Checkin | null): 'ok' | 'pending' | 'missed' | 'unknown' {
  if (!lastCheckIn) {
    return 'unknown';
  }

  if (lastCheckIn.status === 'missed') {
    return 'missed';
  }

  if (lastCheckIn.status === 'help_requested') {
    return 'missed'; // Treat help_requested as high priority
  }

  // Check how long ago the check-in was
  const checkInTime = new Date(lastCheckIn.checked_in_at);
  const now = new Date();
  const hoursSinceCheckIn = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

  // If check-in is within 24 hours, they're ok
  if (hoursSinceCheckIn < 24) {
    return 'ok';
  }

  // If between 24-48 hours, pending
  if (hoursSinceCheckIn < 48) {
    return 'pending';
  }

  // More than 48 hours, missed
  return 'missed';
}

export function useDependents(): UseDependentsResult {
  const { user, profile } = useAuth();
  const [dependents, setDependents] = useState<DependentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use any type for Supabase to bypass strict typing issues
  const db = supabase as any;

  /**
   * Fetch all dependents for the current guardian
   */
  const fetchDependents = useCallback(async () => {
    if (!user || profile?.role !== 'guardian') {
      setDependents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch relationships where current user is guardian
      const { data: relationships, error: relError } = await db
        .from('relationships')
        .select('*')
        .eq('guardian_id', user.id)
        .in('status', ['active', 'pending']);

      if (relError) {
        throw relError;
      }

      if (!relationships || relationships.length === 0) {
        setDependents([]);
        setLoading(false);
        return;
      }

      // Fetch dependent profiles and their latest check-ins
      const dependentData: DependentData[] = await Promise.all(
        relationships.map(async (relationship: Relationship) => {
          let dependentProfile: Profile | null = null;
          let lastCheckIn: Checkin | null = null;

          // Fetch profile if dependent has joined
          if (relationship.dependent_id) {
            const { data: profileData } = await db
              .from('profiles')
              .select('*')
              .eq('id', relationship.dependent_id)
              .single();
            
            dependentProfile = profileData || null;

            // Fetch latest check-in
            const { data: checkinData } = await db
              .from('checkins')
              .select('*')
              .eq('dependent_id', relationship.dependent_id)
              .order('checked_in_at', { ascending: false })
              .limit(1)
              .single();
            
            lastCheckIn = checkinData || null;
          }

          return {
            relationship,
            profile: dependentProfile,
            lastCheckIn,
            status: calculateStatus(lastCheckIn),
          };
        })
      );

      setDependents(dependentData);
      setLoading(false);
    } catch (err) {
      const catchError = err instanceof Error ? err : new Error('Failed to fetch dependents');
      setError(catchError);
      setLoading(false);
    }
  }, [user, profile, db]);

  /**
   * Subscribe to real-time updates for check-ins
   */
  useEffect(() => {
    if (!user || profile?.role !== 'guardian') return;

    // Get all dependent IDs
    const dependentIds = dependents
      .filter(d => d.relationship.dependent_id)
      .map(d => d.relationship.dependent_id);

    if (dependentIds.length === 0) return;

    // Subscribe to check-in updates for all dependents
    const subscription = supabase
      .channel('guardian-checkin-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
        },
        (payload) => {
          const newCheckin = payload.new as Checkin;
          
          // Check if this check-in is from one of our dependents
          if (dependentIds.includes(newCheckin.dependent_id)) {
            // Update the dependent's data
            setDependents(prev => prev.map(d => {
              if (d.relationship.dependent_id === newCheckin.dependent_id) {
                return {
                  ...d,
                  lastCheckIn: newCheckin,
                  status: calculateStatus(newCheckin),
                };
              }
              return d;
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, profile, dependents]);

  // Fetch dependents on mount and when user changes
  useEffect(() => {
    fetchDependents();
  }, [fetchDependents]);

  // Calculate status counts
  const statusCounts = dependents.reduce(
    (acc, d) => {
      if (d.relationship.status === 'active') {
        if (d.status === 'ok') acc.ok++;
        else if (d.status === 'pending') acc.pending++;
        else if (d.status === 'missed') acc.missed++;
      }
      return acc;
    },
    { ok: 0, pending: 0, missed: 0 }
  );

  return {
    dependents,
    loading,
    error,
    refreshDependents: fetchDependents,
    statusCounts,
  };
}
