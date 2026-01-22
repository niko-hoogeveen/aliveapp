/**
 * Core authentication hook for the I'm Okay app.
 * Handles sign in, sign up, sign out, and profile management.
 */

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole, Profile } from '@/types/database';

interface AuthResult {
  success: boolean;
  error?: string;
}

export function useAuth() {
  const {
    session,
    user,
    profile,
    loading,
    initialized,
    error,
    setSession,
    setUser,
    setProfile,
    setLoading,
    setInitialized,
    setError,
    reset,
  } = useAuthStore();

  /**
   * Fetch the user's profile from the database.
   * Returns null if profile doesn't exist (which is normal during signup before trigger runs).
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle() to return null instead of error when no rows

    if (error) {
      // Only log actual errors, not "no rows" which is handled by maybeSingle
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }, []);

  /**
   * Initialize auth state and listen for changes.
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('[useAuth] Initializing auth...');
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        console.log('[useAuth] Initial session check:', {
          hasSession: !!initialSession,
          hasUser: !!initialSession?.user,
          error: sessionError?.message,
        });

        if (!mounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);

          // Fetch profile
          const userProfile = await fetchProfile(initialSession.user.id);
          console.log('[useAuth] Fetched profile:', { hasProfile: !!userProfile, role: userProfile?.role });
          if (mounted) {
            setProfile(userProfile);
          }
        }
      } catch (err) {
        console.error('[useAuth] Error initializing auth:', err);
      } finally {
        if (mounted) {
          console.log('[useAuth] Initialization complete');
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[useAuth] Auth state changed:', {
          event,
          hasSession: !!currentSession,
          userId: currentSession?.user?.id,
        });

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id);
          console.log('[useAuth] Profile after auth change:', { hasProfile: !!userProfile, role: userProfile?.role });
          if (mounted) {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, setSession, setUser, setProfile, setLoading, setInitialized]);

  /**
   * Sign in with email and password.
   */
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    console.log('[useAuth] Signing in...', { email });
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[useAuth] Sign in response:', {
        hasSession: !!data.session,
        hasUser: !!data.user,
        error: error?.message,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Set session and user immediately (don't wait for onAuthStateChange)
      if (data.session) {
        console.log('[useAuth] Setting session and user');
        setSession(data.session);
        setUser(data.user);
      }

      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        console.log('[useAuth] Sign in profile:', { hasProfile: !!userProfile, role: userProfile?.role });
        setProfile(userProfile);
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      console.error('[useAuth] Sign in error:', message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, setLoading, setError, setProfile, setSession, setUser]);

  /**
   * Sign up with email and password.
   */
  const signUp = useCallback(async (
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthResult> => {
    console.log('[useAuth] Signing up...', { email, displayName });
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      console.log('[useAuth] Sign up response:', {
        hasSession: !!data.session,
        hasUser: !!data.user,
        userId: data.user?.id,
        error: error?.message,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      // If session is null but user exists, email confirmation is pending
      if (!data.session && data.user) {
        console.log('[useAuth] Email confirmation required for:', data.user.email);
        console.log('[useAuth] To disable: Supabase Dashboard > Authentication > Providers > Email > Confirm email = OFF');
        // Still set user so we can track the state
        setUser(data.user);
        // Return early - user needs to confirm email first
        setLoading(false);
        return { success: true, error: 'Please check your email to confirm your account' };
      }

      // Set session and user immediately (don't wait for onAuthStateChange)
      if (data.session) {
        console.log('[useAuth] Setting session and user after signup');
        setSession(data.session);
        setUser(data.user);
      }

      // The trigger will auto-create a profile
      // Wait a moment for the trigger to complete, then fetch
      if (data.user) {
        console.log('[useAuth] Waiting for profile trigger...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const userProfile = await fetchProfile(data.user.id);
        console.log('[useAuth] Sign up profile:', { hasProfile: !!userProfile, role: userProfile?.role });
        setProfile(userProfile);
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      console.error('[useAuth] Sign up error:', message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, setLoading, setError, setProfile, setSession, setUser]);

  /**
   * Sign out the current user.
   */
  const signOut = useCallback(async (): Promise<AuthResult> => {
    console.log('[useAuth] Signing out...');
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[useAuth] Sign out error:', error.message);
        setError(error.message);
        return { success: false, error: error.message };
      }

      console.log('[useAuth] Sign out successful, resetting state');
      // Reset clears session/user/profile but keeps initialized=true
      // so AuthProvider can navigate to login
      reset();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      console.error('[useAuth] Sign out exception:', message);
      setError(message);
      return { success: false, error: message };
    }
  }, [reset, setError]);

  /**
   * Set the user's role (guardian or dependent).
   */
  const setRole = useCallback(async (role: UserRole): Promise<AuthResult> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Refresh profile
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set role';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfile, setLoading, setError, setProfile]);

  /**
   * Update the user's profile.
   */
  const updateProfile = useCallback(async (
    updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'phone' | 'push_token'>>
  ): Promise<AuthResult> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Refresh profile
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfile, setLoading, setError, setProfile]);

  return {
    // State
    session,
    user,
    profile,
    loading,
    initialized,
    error,
    isAuthenticated: !!session,
    role: profile?.role ?? null,

    // Actions
    signIn,
    signUp,
    signOut,
    setRole,
    updateProfile,
    fetchProfile,
  };
}
