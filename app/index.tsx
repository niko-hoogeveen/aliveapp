/**
 * App Entry Point
 * 
 * Redirects to the appropriate screen based on auth state.
 * For now, redirects to the auth flow.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check auth state and redirect accordingly
  // For now, redirect to role select to demonstrate the app
  return <Redirect href="/(auth)/role-select" />;
}
