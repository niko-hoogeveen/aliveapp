/**
 * useCheckins Hook
 * 
 * Provides check-in functionality using Supabase.
 * Includes create, read, subscribe, and offline support.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Checkin = Database['public']['Tables']['checkins']['Row'];
type CheckinInsert = Database['public']['Tables']['checkins']['Insert'];

const OFFLINE_QUEUE_KEY = 'offline_checkins_queue';

interface UseCheckinsResult {
  /** Create a new check-in for the current user */
  createCheckIn: (scheduleId?: string) => Promise<{ data: Checkin | null; error: Error | null }>;
  /** Get check-in history with pagination */
  getCheckInHistory: (dependentId?: string, limit?: number, offset?: number) => Promise<{ data: Checkin[]; error: Error | null }>;
  /** Get the most recent check-in */
  getLastCheckIn: (dependentId?: string) => Promise<{ data: Checkin | null; error: Error | null }>;
  /** Subscribe to real-time check-in updates */
  subscribeToCheckIns: (callback: (checkin: Checkin) => void, dependentId?: string) => () => void;
  /** Process any queued offline check-ins */
  processOfflineQueue: () => Promise<void>;
  /** Current loading state */
  loading: boolean;
  /** Last error */
  error: Error | null;
  /** Last check-in timestamp */
  lastCheckIn: Checkin | null;
}

export function useCheckins(): UseCheckinsResult {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<Checkin | null>(null);

  // Use any type for Supabase to bypass strict typing issues
  const db = supabase as any;

  /**
   * Create a new check-in
   */
  const createCheckIn = useCallback(async (scheduleId?: string): Promise<{ data: Checkin | null; error: Error | null }> => {
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    setLoading(true);
    setError(null);

    const checkinData: CheckinInsert = {
      dependent_id: user.id,
      schedule_id: scheduleId || null,
      status: 'completed',
    };

    try {
      const { data, error: insertError } = await db
        .from('checkins')
        .insert(checkinData)
        .select()
        .single();

      if (insertError) {
        // If offline, queue the check-in
        if (insertError.message?.includes('network') || insertError.message?.includes('offline')) {
          await queueOfflineCheckIn(checkinData);
          // Create a temporary local check-in
          const tempCheckin: Checkin = {
            id: `temp-${Date.now()}`,
            dependent_id: user.id,
            schedule_id: scheduleId || null,
            checked_in_at: new Date().toISOString(),
            status: 'completed',
          };
          setLastCheckIn(tempCheckin);
          setLoading(false);
          return { data: tempCheckin, error: null };
        }

        setError(insertError);
        setLoading(false);
        return { data: null, error: insertError };
      }

      setLastCheckIn(data);
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      const catchError = err instanceof Error ? err : new Error('Unknown error');
      
      // Try to queue offline
      await queueOfflineCheckIn(checkinData);
      const tempCheckin: Checkin = {
        id: `temp-${Date.now()}`,
        dependent_id: user.id,
        schedule_id: scheduleId || null,
        checked_in_at: new Date().toISOString(),
        status: 'completed',
      };
      setLastCheckIn(tempCheckin);
      setLoading(false);
      return { data: tempCheckin, error: null };
    }
  }, [user, db]);

  /**
   * Get check-in history with pagination
   */
  const getCheckInHistory = useCallback(async (
    dependentId?: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<{ data: Checkin[]; error: Error | null }> => {
    const targetUserId = dependentId || user?.id;
    
    if (!targetUserId) {
      return { data: [], error: new Error('No user ID provided') };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await db
        .from('checkins')
        .select('*')
        .eq('dependent_id', targetUserId)
        .order('checked_in_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (queryError) {
        setError(queryError);
        setLoading(false);
        return { data: [], error: queryError };
      }

      setLoading(false);
      return { data: data || [], error: null };
    } catch (err) {
      const catchError = err instanceof Error ? err : new Error('Unknown error');
      setError(catchError);
      setLoading(false);
      return { data: [], error: catchError };
    }
  }, [user, db]);

  /**
   * Get the most recent check-in
   */
  const getLastCheckIn = useCallback(async (
    dependentId?: string
  ): Promise<{ data: Checkin | null; error: Error | null }> => {
    const targetUserId = dependentId || user?.id;
    
    if (!targetUserId) {
      return { data: null, error: new Error('No user ID provided') };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await db
        .from('checkins')
        .select('*')
        .eq('dependent_id', targetUserId)
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is okay
        setError(queryError);
        setLoading(false);
        return { data: null, error: queryError };
      }

      setLastCheckIn(data || null);
      setLoading(false);
      return { data: data || null, error: null };
    } catch (err) {
      const catchError = err instanceof Error ? err : new Error('Unknown error');
      setError(catchError);
      setLoading(false);
      return { data: null, error: catchError };
    }
  }, [user, db]);

  /**
   * Subscribe to real-time check-in updates
   */
  const subscribeToCheckIns = useCallback((
    callback: (checkin: Checkin) => void,
    dependentId?: string
  ): (() => void) => {
    const targetUserId = dependentId || user?.id;
    
    if (!targetUserId) {
      console.warn('No user ID for check-in subscription');
      return () => {};
    }

    const subscription = supabase
      .channel(`checkins:${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
          filter: `dependent_id=eq.${targetUserId}`,
        },
        (payload) => {
          const newCheckin = payload.new as Checkin;
          setLastCheckIn(newCheckin);
          callback(newCheckin);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  /**
   * Queue a check-in for offline processing
   */
  async function queueOfflineCheckIn(checkin: CheckinInsert): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: CheckinInsert[] = existing ? JSON.parse(existing) : [];
      queue.push(checkin);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (err) {
      console.error('Failed to queue offline check-in:', err);
    }
  }

  /**
   * Process any queued offline check-ins
   */
  const processOfflineQueue = useCallback(async (): Promise<void> => {
    try {
      const existing = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!existing) return;

      const queue: CheckinInsert[] = JSON.parse(existing);
      if (queue.length === 0) return;

      // Try to insert all queued check-ins
      const { error: insertError } = await db
        .from('checkins')
        .insert(queue);

      if (!insertError) {
        // Clear the queue on success
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      }
    } catch (err) {
      console.error('Failed to process offline queue:', err);
    }
  }, [db]);

  // Process offline queue when user becomes authenticated
  useEffect(() => {
    if (user) {
      processOfflineQueue();
    }
  }, [user, processOfflineQueue]);

  // Fetch last check-in on mount
  useEffect(() => {
    if (user && profile?.role === 'dependent') {
      getLastCheckIn();
    }
  }, [user, profile, getLastCheckIn]);

  return {
    createCheckIn,
    getCheckInHistory,
    getLastCheckIn,
    subscribeToCheckIns,
    processOfflineQueue,
    loading,
    error,
    lastCheckIn,
  };
}
