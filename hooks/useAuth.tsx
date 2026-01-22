/**
 * useAuth Hook
 * 
 * Provides authentication state and methods using Supabase Auth.
 * Includes session management, user profile, and auth actions.
 * Supports UI preview mode when Supabase credentials are not configured.
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isPreviewMode } from '@/lib/supabase';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Mock data for UI preview mode
const MOCK_USER: User = {
  id: 'preview-user-123',
  email: 'preview@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const MOCK_PROFILE_GUARDIAN: Profile = {
  id: 'preview-user-123',
  role: 'guardian',
  display_name: 'Preview User',
  avatar_url: null,
  push_token: null,
  phone: '+1234567890',
  created_at: new Date().toISOString(),
};

const MOCK_PROFILE_DEPENDENT: Profile = {
  id: 'preview-user-123',
  role: 'dependent',
  display_name: 'Preview User',
  avatar_url: null,
  push_token: null,
  phone: '+1234567890',
  created_at: new Date().toISOString(),
};

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: AuthError | Error | null;
  isPreviewMode: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  // Preview mode helpers
  setPreviewRole: (role: 'guardian' | 'dependent') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the app and provides auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    error: null,
    isPreviewMode,
  });

  /**
   * Set preview role (for UI testing)
   */
  const setPreviewRole = useCallback((role: 'guardian' | 'dependent') => {
    if (!isPreviewMode) return;
    
    const mockProfile = role === 'guardian' ? MOCK_PROFILE_GUARDIAN : MOCK_PROFILE_DEPENDENT;
    setState(prev => ({
      ...prev,
      profile: { ...mockProfile, role },
    }));
  }, []);

  /**
   * Fetch user profile from the profiles table
   */
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    // In preview mode, return mock profile
    if (isPreviewMode) {
      return null; // No profile until role is selected
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet (new user)
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }, []);

  /**
   * Refresh the current user's profile
   */
  const refreshProfile = useCallback(async () => {
    if (isPreviewMode) return;
    
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));
    }
  }, [state.user, fetchProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    // In preview mode, simulate successful sign in
    if (isPreviewMode) {
      setState(prev => ({
        ...prev,
        user: MOCK_USER,
        session: { user: MOCK_USER } as Session,
        loading: false,
      }));
      return { error: null };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return { error };
    }

    // Profile will be fetched by the auth state change listener
    return { error: null };
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (email: string, password: string) => {
    // In preview mode, simulate successful sign up
    if (isPreviewMode) {
      setState(prev => ({
        ...prev,
        user: MOCK_USER,
        session: { user: MOCK_USER } as Session,
        loading: false,
      }));
      return { error: null };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return { error };
    }

    // Profile will be created by database trigger and fetched by auth state change
    return { error: null };
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    // In preview mode, just clear state
    if (isPreviewMode) {
      setState({
        session: null,
        user: null,
        profile: null,
        loading: false,
        error: null,
        isPreviewMode: true,
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    await supabase.auth.signOut();
    
    setState({
      session: null,
      user: null,
      profile: null,
      loading: false,
      error: null,
      isPreviewMode: false,
    });
  }, []);

  /**
   * Update the current user's profile
   */
  const updateProfile = useCallback(async (data: ProfileUpdate) => {
    // In preview mode, just update local state
    if (isPreviewMode) {
      const mockProfile = data.role === 'guardian' ? MOCK_PROFILE_GUARDIAN : MOCK_PROFILE_DEPENDENT;
      setState(prev => ({
        ...prev,
        profile: { ...mockProfile, ...data } as Profile,
        loading: false,
      }));
      return { error: null };
    }

    if (!state.user) {
      return { error: new Error('No user logged in') };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Check if profile exists
    const existingProfile = await fetchProfile(state.user.id);
    
    let queryError: Error | null = null;
    
    // Use type assertion to bypass strict typing issues
    const db = supabase as any;
    
    if (existingProfile) {
      // Update existing profile
      const { error } = await db
        .from('profiles')
        .update(data)
        .eq('id', state.user.id);
      queryError = error;
    } else {
      // Insert new profile - need role for insert
      const insertData = {
        id: state.user.id,
        role: data.role || 'dependent',
        ...data,
      };
      
      const { error } = await db
        .from('profiles')
        .insert(insertData);
      queryError = error;
    }

    if (queryError) {
      setState(prev => ({ ...prev, loading: false, error: queryError }));
      return { error: queryError };
    }

    // Refresh profile after update
    const profile = await fetchProfile(state.user.id);
    setState(prev => ({ ...prev, profile, loading: false }));

    return { error: null };
  }, [state.user, fetchProfile]);

  /**
   * Set up auth state change listener
   */
  useEffect(() => {
    // In preview mode, skip Supabase auth and set ready state
    if (isPreviewMode) {
      setState({
        session: null,
        user: null,
        profile: null,
        loading: false,
        error: null,
        isPreviewMode: true,
      });
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          session,
          user: session.user,
          profile,
          loading: false,
          error: null,
          isPreviewMode: false,
        });
      } else {
        setState({
          session: null,
          user: null,
          profile: null,
          loading: false,
          error: null,
          isPreviewMode: false,
        });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            session,
            user: session.user,
            profile,
            loading: false,
            error: null,
            isPreviewMode: false,
          });
        } else {
          setState({
            session: null,
            user: null,
            profile: null,
            loading: false,
            error: null,
            isPreviewMode: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    setPreviewRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * 
 * Usage:
 * ```ts
 * const { user, profile, signIn, signOut } = useAuth();
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
