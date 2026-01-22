/**
 * Supabase Client
 * 
 * Singleton Supabase client with Expo Secure Store for token persistence.
 * Supports UI preview mode when credentials are not configured.
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '@/types/database';

// Check if we have real credentials
const hasCredentials = !!(
  process.env.EXPO_PUBLIC_SUPABASE_URL &&
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Use placeholder values for UI preview mode when credentials are missing
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

// Export flag for other modules to check
export const isPreviewMode = !hasCredentials;

if (isPreviewMode) {
  console.warn(
    '🎨 UI Preview Mode Active\n' +
    'Supabase credentials not configured.\n' +
    'App will run with mock data for UI inspection.'
  );
}

/**
 * Expo Secure Store adapter for Supabase Auth
 * Stores auth tokens securely on the device
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      console.warn('Failed to save to secure store:', key);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      console.warn('Failed to remove from secure store:', key);
    }
  },
};

/**
 * Supabase client instance
 * 
 * Usage:
 * ```ts
 * import { supabase } from '@/lib/supabase';
 * 
 * const { data, error } = await supabase.from('profiles').select();
 * ```
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
