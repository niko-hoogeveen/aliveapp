/**
 * Send Push Notification Edge Function
 * 
 * Sends push notifications to users via Expo Push API.
 * Called by scheduled tasks (pg_cron) or from client for immediate notifications.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushNotificationRequest {
  // Target user ID or push token
  userId?: string;
  pushToken?: string;
  
  // Notification content
  title: string;
  body: string;
  data?: Record<string, unknown>;
  
  // Optional settings
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const payload: PushNotificationRequest = await req.json();
    
    // Validate required fields
    if (!payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let pushToken = payload.pushToken;

    // If userId provided, look up push token from database
    if (payload.userId && !pushToken) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('id', payload.userId)
        .single();

      if (error || !profile?.push_token) {
        return new Response(
          JSON.stringify({ error: 'User not found or has no push token' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      pushToken = profile.push_token;
    }

    if (!pushToken) {
      return new Response(
        JSON.stringify({ error: 'No push token provided or found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build Expo push message
    const message: ExpoPushMessage = {
      to: pushToken,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: payload.sound || 'default',
      badge: payload.badge,
      channelId: payload.channelId || 'default',
      priority: payload.priority || 'high',
    };

    // Send to Expo Push API
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Expo Push API error:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to send notification', details: result }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Push notification sent:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
