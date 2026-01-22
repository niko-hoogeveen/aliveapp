/**
 * Hook for guardians to manage and view their dependents.
 * Includes real-time updates via Supabase subscriptions.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Profile, Relationship, CheckIn } from '@/types/database';

export interface DependentWithStatus extends Profile {
  relationshipId: string;
  relationshipStatus: Relationship['status'];
  lastCheckIn: CheckIn | null;
  todayCheckIns: CheckIn[];
}

interface UseDependentsReturn {
  dependents: DependentWithStatus[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for guardians to fetch and monitor their dependents.
 * Includes real-time subscription for check-in updates.
 */
export function useDependents(): UseDependentsReturn {
  const { user } = useAuthStore();
  const [dependents, setDependents] = useState<DependentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDependents = useCallback(async () => {
    if (!user) {
      setDependents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch relationships where user is guardian
      const { data: relationships, error: relError } = await supabase
        .from('relationships')
        .select('*')
        .eq('guardian_id', user.id)
        .in('status', ['active', 'pending']);

      if (relError) {
        setError(relError.message);
        setLoading(false);
        return;
      }

      if (!relationships || relationships.length === 0) {
        setDependents([]);
        setLoading(false);
        return;
      }

      // Get dependent IDs (filter out null dependent_ids for pending invites)
      const dependentIds = relationships
        .filter(r => r.dependent_id)
        .map(r => r.dependent_id as string);

      // Fetch dependent profiles
      let profiles: Profile[] = [];
      if (dependentIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', dependentIds);

        if (profilesError) {
          setError(profilesError.message);
          setLoading(false);
          return;
        }

        profiles = profilesData || [];
      }

      // Get today's start for check-in filtering
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Fetch recent check-ins for all dependents
      let checkIns: CheckIn[] = [];
      if (dependentIds.length > 0) {
        const { data: checkInsData, error: checkInsError } = await supabase
          .from('checkins')
          .select('*')
          .in('dependent_id', dependentIds)
          .gte('checked_in_at', todayStart.toISOString())
          .order('checked_in_at', { ascending: false });

        if (checkInsError) {
          console.error('Error fetching check-ins:', checkInsError);
        } else {
          checkIns = checkInsData || [];
        }
      }

      // Combine data
      const dependentsWithStatus: DependentWithStatus[] = relationships
        .filter(rel => rel.status === 'active' && rel.dependent_id)
        .map(rel => {
          const profile = profiles.find(p => p.id === rel.dependent_id);
          const dependentCheckIns = checkIns.filter(c => c.dependent_id === rel.dependent_id);
          
          return {
            ...(profile || {
              id: rel.dependent_id!,
              role: 'dependent' as const,
              display_name: null,
              avatar_url: null,
              push_token: null,
              phone: null,
              created_at: rel.created_at,
            }),
            relationshipId: rel.id,
            relationshipStatus: rel.status,
            lastCheckIn: dependentCheckIns[0] || null,
            todayCheckIns: dependentCheckIns,
          };
        });

      setDependents(dependentsWithStatus);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dependents';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDependents();
  }, [fetchDependents]);

  // Set up real-time subscription for check-ins
  useEffect(() => {
    if (!user) return;

    // Subscribe to check-in changes for dependents
    const channel = supabase
      .channel('dependent-checkins')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
        },
        (payload) => {
          // Refetch to update the dependent's status
          // In a more optimized version, we'd update just the affected dependent
          fetchDependents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDependents]);

  // Also subscribe to relationship changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('guardian-relationships')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'relationships',
          filter: `guardian_id=eq.${user.id}`,
        },
        () => {
          fetchDependents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDependents]);

  return {
    dependents,
    loading,
    error,
    refetch: fetchDependents,
  };
}
