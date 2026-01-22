/**
 * Hook for managing user profiles.
 * Provides profile data and methods to update it.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'phone'>>) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (uri: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage a user's profile.
 * @param userId - The user ID to fetch profile for. If not provided, does nothing.
 */
export function useProfile(userId?: string): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Returns null instead of error when no rows

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setProfile(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (
    updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'phone'>>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      // Refetch to get updated data
      await fetchProfile();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [userId, fetchProfile]);

  const uploadAvatar = useCallback(async (
    uri: string
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'No user ID provided' };
    }

    setLoading(true);
    setError(null);

    try {
      // Generate unique filename
      const ext = uri.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${ext}`;
      const filePath = `avatars/${fileName}`;

      // Read file as blob (in React Native, we need to use fetch)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadError) {
        setError(uploadError.message);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const updateResult = await updateProfile({ avatar_url: publicUrl });

      if (!updateResult.success) {
        return { success: false, error: updateResult.error };
      }

      return { success: true, url: publicUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [userId, updateProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
}
