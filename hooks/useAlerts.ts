/**
 * useAlerts Hook
 * 
 * Provides alert data for guardians - missed check-ins and important notifications.
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/types/database';

type Checkin = Database['public']['Tables']['checkins']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Relationship = Database['public']['Tables']['relationships']['Row'];

export interface Alert {
  id: string;
  type: 'missed' | 'help_requested' | 'completed';
  checkin: Checkin;
  dependent: Profile | null;
  relationship: Relationship | null;
  isRead: boolean;
  timestamp: string;
}

const READ_ALERTS_KEY = 'read_alerts';

interface UseAlertsResult {
  /** List of alerts */
  alerts: Alert[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Number of unread alerts */
  unreadCount: number;
  /** Refresh alerts */
  refreshAlerts: () => Promise<void>;
  /** Mark alert as read */
  markAsRead: (alertId: string) => Promise<void>;
  /** Mark all alerts as read */
  markAllAsRead: () => Promise<void>;
}

export function useAlerts(): UseAlertsResult {
  const { user, profile } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const db = supabase as any;

  /**
   * Load read alert IDs from storage
   */
  const loadReadAlerts = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(READ_ALERTS_KEY);
      if (stored) {
        setReadAlertIds(new Set(JSON.parse(stored)));
      }
    } catch (err) {
      console.error('Error loading read alerts:', err);
    }
  }, []);

  /**
   * Save read alert IDs to storage
   */
  const saveReadAlerts = useCallback(async (ids: Set<string>) => {
    try {
      await AsyncStorage.setItem(READ_ALERTS_KEY, JSON.stringify([...ids]));
    } catch (err) {
      console.error('Error saving read alerts:', err);
    }
  }, []);

  /**
   * Fetch alerts from database
   */
  const fetchAlerts = useCallback(async () => {
    if (!user || profile?.role !== 'guardian') {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get relationships where current user is guardian
      const { data: relationships, error: relError } = await db
        .from('relationships')
        .select('*')
        .eq('guardian_id', user.id)
        .eq('status', 'active');

      if (relError) throw relError;

      if (!relationships || relationships.length === 0) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      const dependentIds = relationships
        .filter((r: Relationship) => r.dependent_id)
        .map((r: Relationship) => r.dependent_id);

      if (dependentIds.length === 0) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      // Fetch recent check-ins (last 7 days) for all dependents
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: checkIns, error: checkInError } = await db
        .from('checkins')
        .select('*')
        .in('dependent_id', dependentIds)
        .gte('checked_in_at', sevenDaysAgo.toISOString())
        .order('checked_in_at', { ascending: false });

      if (checkInError) throw checkInError;

      // Fetch dependent profiles
      const { data: profiles, error: profileError } = await db
        .from('profiles')
        .select('*')
        .in('id', dependentIds);

      if (profileError) throw profileError;

      // Create profile and relationship maps
      const profileMap = new Map<string, Profile>();
      const relationshipMap = new Map<string, Relationship>();

      (profiles || []).forEach((p: Profile) => profileMap.set(p.id, p));
      (relationships || []).forEach((r: Relationship) => {
        if (r.dependent_id) {
          relationshipMap.set(r.dependent_id, r);
        }
      });

      // Convert check-ins to alerts
      // Only include missed check-ins and help_requested, plus recent completed
      const alertList: Alert[] = (checkIns || [])
        .filter((c: Checkin) => 
          c.status === 'missed' || 
          c.status === 'help_requested' ||
          (c.status === 'completed' && isRecent(c.checked_in_at, 24)) // Show completed from last 24 hours
        )
        .map((c: Checkin) => ({
          id: c.id,
          type: c.status as 'missed' | 'help_requested' | 'completed',
          checkin: c,
          dependent: profileMap.get(c.dependent_id) || null,
          relationship: relationshipMap.get(c.dependent_id) || null,
          isRead: readAlertIds.has(c.id),
          timestamp: c.checked_in_at,
        }));

      // Sort by timestamp descending, with missed/help_requested first
      alertList.sort((a, b) => {
        // Prioritize missed and help_requested
        const priorityA = a.type === 'missed' || a.type === 'help_requested' ? 0 : 1;
        const priorityB = b.type === 'missed' || b.type === 'help_requested' ? 0 : 1;
        
        if (priorityA !== priorityB) return priorityA - priorityB;
        
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setAlerts(alertList);
    } catch (err) {
      const catchError = err instanceof Error ? err : new Error('Failed to fetch alerts');
      setError(catchError);
    } finally {
      setLoading(false);
    }
  }, [user, profile, db, readAlertIds]);

  /**
   * Check if a timestamp is within the last N hours
   */
  function isRecent(timestamp: string, hours: number): boolean {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffHours <= hours;
  }

  /**
   * Mark an alert as read
   */
  const markAsRead = useCallback(async (alertId: string) => {
    const newReadIds = new Set(readAlertIds);
    newReadIds.add(alertId);
    setReadAlertIds(newReadIds);
    await saveReadAlerts(newReadIds);

    // Update alerts state
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    ));
  }, [readAlertIds, saveReadAlerts]);

  /**
   * Mark all alerts as read
   */
  const markAllAsRead = useCallback(async () => {
    const newReadIds = new Set(readAlertIds);
    alerts.forEach(a => newReadIds.add(a.id));
    setReadAlertIds(newReadIds);
    await saveReadAlerts(newReadIds);

    // Update alerts state
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  }, [alerts, readAlertIds, saveReadAlerts]);

  // Load read alerts and fetch data on mount
  useEffect(() => {
    loadReadAlerts().then(() => fetchAlerts());
  }, [loadReadAlerts, fetchAlerts]);

  // Subscribe to real-time check-in updates
  useEffect(() => {
    if (!user || profile?.role !== 'guardian') return;

    const subscription = supabase
      .channel('guardian-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'checkins',
        },
        () => {
          // Refresh alerts when new check-in occurs
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, profile, fetchAlerts]);

  // Calculate unread count
  const unreadCount = alerts.filter(a => 
    !a.isRead && (a.type === 'missed' || a.type === 'help_requested')
  ).length;

  return {
    alerts,
    loading,
    error,
    unreadCount,
    refreshAlerts: fetchAlerts,
    markAsRead,
    markAllAsRead,
  };
}
