/**
 * Hook for managing check-ins.
 * Used by dependents to create check-ins and view history.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { CheckIn } from '@/types/database';

interface UseCheckinsReturn {
  lastCheckIn: CheckIn | null;
  todayCheckIns: CheckIn[];
  hasCheckedInToday: boolean;
  loading: boolean;
  error: string | null;
  createCheckIn: () => Promise<{ success: boolean; error?: string }>;
  getHistory: (limit?: number) => Promise<CheckIn[]>;
  refetch: () => Promise<void>;
}

/**
 * Hook for dependents to manage their check-ins.
 * Includes real-time subscription for updates.
 */
export function useCheckins(): UseCheckinsReturn {
  const { user, profile } = useAuthStore();
  const [lastCheckIn, setLastCheckIn] = useState<CheckIn | null>(null);
  const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayCheckIns = useCallback(async () => {
    if (!user) {
      setLastCheckIn(null);
      setTodayCheckIns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get start of today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error: fetchError } = await supabase
        .from('checkins')
        .select('*')
        .eq('dependent_id', user.id)
        .gte('checked_in_at', todayStart.toISOString())
        .order('checked_in_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const checkIns = data || [];
      setTodayCheckIns(checkIns);
      setLastCheckIn(checkIns[0] || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch check-ins';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTodayCheckIns();
  }, [fetchTodayCheckIns]);

  // Real-time subscription for check-in updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('my-checkins')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
          filter: `dependent_id=eq.${user.id}`,
        },
        (payload) => {
          const newCheckIn = payload.new as CheckIn;
          setTodayCheckIns(prev => [newCheckIn, ...prev]);
          setLastCheckIn(newCheckIn);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  /**
   * Create a new check-in for the current user.
   */
  const createCheckIn = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    if (profile?.role !== 'dependent') {
      return { success: false, error: 'Only dependents can check in' };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('checkins')
        .insert({
          dependent_id: user.id,
          status: 'completed',
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return { success: false, error: insertError.message };
      }

      // Update local state immediately (realtime will also update)
      if (data) {
        setLastCheckIn(data);
        setTodayCheckIns(prev => [data, ...prev]);
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check in';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role]);

  /**
   * Get check-in history for the current user.
   */
  const getHistory = useCallback(async (limit = 30): Promise<CheckIn[]> => {
    if (!user) {
      return [];
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('checkins')
        .select('*')
        .eq('dependent_id', user.id)
        .order('checked_in_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        console.error('Error fetching history:', fetchError);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  }, [user]);

  const hasCheckedInToday = todayCheckIns.length > 0;

  return {
    lastCheckIn,
    todayCheckIns,
    hasCheckedInToday,
    loading,
    error,
    createCheckIn,
    getHistory,
    refetch: fetchTodayCheckIns,
  };
}
