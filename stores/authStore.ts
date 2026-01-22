/**
 * Auth store using Zustand.
 * Manages authentication state including session, user, and profile.
 */

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  session: null,
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  setError: (error) => set({ error }),

  // Reset clears auth data but keeps initialized=true and loading=false
  // so navigation still works after sign out
  reset: () => set({
    session: null,
    user: null,
    profile: null,
    loading: false,
    initialized: true,
    error: null,
  }),
}));
