/**
 * Root index - redirects to auth or appropriate role screen.
 */

import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check auth state and user role from useAuth hook
  // For now, redirect to login
  const isAuthenticated = false;
  const userRole = null; // 'guardian' | 'dependent' | null

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (userRole === 'dependent') {
    return <Redirect href="/(dependent)" />;
  }

  if (userRole === 'guardian') {
    return <Redirect href="/(guardian)" />;
  }

  // Fallback to role selection
  return <Redirect href="/(auth)/role-select" />;
}
