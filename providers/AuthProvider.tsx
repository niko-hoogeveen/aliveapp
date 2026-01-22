/**
 * Auth provider that manages authentication state and navigation guards.
 * Wraps the app and handles automatic redirects based on auth state.
 */

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import type { Profile, UserRole } from '@/types/database';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  setRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'phone' | 'push_token'>>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hook to access auth context. Must be used within AuthProvider.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component that handles navigation based on auth state.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Don't navigate until the router is ready and auth is initialized
    if (!navigationState?.key || !auth.initialized) {
      console.log('[AuthProvider] Waiting for initialization...', {
        hasNavigationState: !!navigationState?.key,
        initialized: auth.initialized,
      });
      return;
    }

    // Skip navigation during loading to prevent race conditions
    if (auth.loading) {
      console.log('[AuthProvider] Skipping navigation during loading');
      return;
    }

    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === '(auth)';
    const inDependentGroup = currentSegment === '(dependent)';
    const inGuardianGroup = currentSegment === '(guardian)';
    const inSharedGroup = currentSegment === '(shared)';

    console.log('[AuthProvider] Navigation check:', {
      isAuthenticated: auth.isAuthenticated,
      hasProfile: !!auth.profile,
      role: auth.profile?.role,
      currentSegment,
      loading: auth.loading,
    });

    if (!auth.isAuthenticated) {
      // Not logged in, redirect to login if not already in auth group
      if (!inAuthGroup) {
        console.log('[AuthProvider] Redirecting to login (not authenticated)');
        router.replace('/(auth)/login');
      }
    } else if (!auth.profile?.role) {
      // Logged in but no role selected, go to role selection
      const currentPath = segments.join('/');
      if (currentPath !== '(auth)/role-select') {
        console.log('[AuthProvider] Redirecting to role-select (no role)');
        router.replace('/(auth)/role-select');
      }
    } else {
      // Logged in with role
      const role = auth.profile.role;

      // Handle undefined segment (root or initial load) - redirect to correct home
      if (!currentSegment) {
        console.log('[AuthProvider] Redirecting from root to main app, role:', role);
        if (role === 'dependent') {
          router.replace('/(dependent)');
        } else {
          router.replace('/(guardian)');
        }
        return;
      }

      if (inAuthGroup) {
        // Redirect away from auth screens
        console.log('[AuthProvider] Redirecting to main app, role:', role);
        if (role === 'dependent') {
          router.replace('/(dependent)');
        } else {
          router.replace('/(guardian)');
        }
      } else if (role === 'dependent' && inGuardianGroup) {
        // Dependent trying to access guardian screens
        console.log('[AuthProvider] Dependent cannot access guardian screens');
        router.replace('/(dependent)');
      } else if (role === 'guardian' && inDependentGroup) {
        // Guardian trying to access dependent screens
        console.log('[AuthProvider] Guardian cannot access dependent screens');
        router.replace('/(guardian)');
      }
      // Allow shared screens for both roles
    }
  }, [auth.initialized, auth.isAuthenticated, auth.profile?.role, segments, navigationState?.key, router, auth.loading]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}
