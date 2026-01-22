/**
 * Hook for managing guardian-dependent relationships.
 * Handles invite creation, joining, and relationship management.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Relationship, Profile } from '@/types/database';

export interface RelationshipWithProfile extends Relationship {
  guardianProfile?: Profile;
  dependentProfile?: Profile;
}

interface UseRelationshipsReturn {
  relationships: RelationshipWithProfile[];
  pendingInvites: Relationship[];
  loading: boolean;
  error: string | null;
  createInvite: () => Promise<{ success: boolean; inviteCode?: string; error?: string }>;
  joinWithCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  acceptRelationship: (relationshipId: string) => Promise<{ success: boolean; error?: string }>;
  removeRelationship: (relationshipId: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

/**
 * Generate a random 6-character invite code.
 * Excludes ambiguous characters (0, O, I, l, 1).
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Hook for managing relationships between guardians and dependents.
 */
export function useRelationships(): UseRelationshipsReturn {
  const { user, profile } = useAuthStore();
  const [relationships, setRelationships] = useState<RelationshipWithProfile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationships = useCallback(async () => {
    if (!user) {
      setRelationships([]);
      setPendingInvites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isGuardian = profile?.role === 'guardian';
      
      // Query based on role
      const query = supabase
        .from('relationships')
        .select('*')
        .or(
          isGuardian
            ? `guardian_id.eq.${user.id}`
            : `dependent_id.eq.${user.id}`
        );

      const { data: relationshipsData, error: relError } = await query;

      if (relError) {
        setError(relError.message);
        setLoading(false);
        return;
      }

      if (!relationshipsData || relationshipsData.length === 0) {
        setRelationships([]);
        setPendingInvites([]);
        setLoading(false);
        return;
      }

      // Separate pending invites (without dependent assigned) from active relationships
      const pending = relationshipsData.filter(
        r => r.status === 'pending' && !r.dependent_id && isGuardian
      );
      const active = relationshipsData.filter(
        r => r.status === 'active' || (r.status === 'pending' && r.dependent_id)
      );

      setPendingInvites(pending);

      // Fetch profiles for active relationships
      const profileIds = new Set<string>();
      active.forEach(r => {
        if (r.guardian_id) profileIds.add(r.guardian_id);
        if (r.dependent_id) profileIds.add(r.dependent_id);
      });

      let profiles: Profile[] = [];
      if (profileIds.size > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', Array.from(profileIds));
        
        profiles = profilesData || [];
      }

      // Combine relationships with profiles
      const relationshipsWithProfiles: RelationshipWithProfile[] = active.map(rel => ({
        ...rel,
        guardianProfile: profiles.find(p => p.id === rel.guardian_id),
        dependentProfile: rel.dependent_id 
          ? profiles.find(p => p.id === rel.dependent_id)
          : undefined,
      }));

      setRelationships(relationshipsWithProfiles);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch relationships';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  /**
   * Create a new invite code (guardian only).
   * Deletes any existing pending invites before creating a new one.
   */
  const createInvite = useCallback(async (): Promise<{ 
    success: boolean; 
    inviteCode?: string; 
    error?: string 
  }> => {
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    if (profile?.role !== 'guardian') {
      return { success: false, error: 'Only guardians can create invites' };
    }

    setLoading(true);
    setError(null);

    console.log('[useRelationships] Creating invite for guardian:', user.id);

    try {
      // Delete any existing pending invites (ones without a dependent)
      const { error: deleteError } = await supabase
        .from('relationships')
        .delete()
        .eq('guardian_id', user.id)
        .eq('status', 'pending')
        .is('dependent_id', null);

      if (deleteError) {
        console.warn('[useRelationships] Error deleting old invites:', deleteError);
        // Continue anyway - not critical
      } else {
        console.log('[useRelationships] Deleted old pending invites');
      }

      // Generate a unique invite code
      let inviteCode = generateInviteCode();
      let attempts = 0;
      const maxAttempts = 5;

      // Check for uniqueness
      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('relationships')
          .select('id')
          .eq('invite_code', inviteCode)
          .maybeSingle();

        if (!existing) break;
        
        inviteCode = generateInviteCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return { success: false, error: 'Failed to generate unique code' };
      }

      console.log('[useRelationships] Generated invite code:', inviteCode);

      // Create the relationship with pending status
      const { data: insertedData, error: insertError } = await supabase
        .from('relationships')
        .insert({
          guardian_id: user.id,
          invite_code: inviteCode,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('[useRelationships] Error creating invite:', insertError);
        setError(insertError.message);
        return { success: false, error: insertError.message };
      }

      console.log('[useRelationships] Invite created successfully:', insertedData);

      await fetchRelationships();
      return { success: true, inviteCode };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create invite';
      console.error('[useRelationships] Unexpected error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role, fetchRelationships]);

  /**
   * Join a guardian using an invite code (dependent only).
   */
  const joinWithCode = useCallback(async (
    code: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    if (profile?.role !== 'dependent') {
      return { success: false, error: 'Only dependents can join with codes' };
    }

    setLoading(true);
    setError(null);

    const normalizedCode = code.toUpperCase().trim();
    console.log('[useRelationships] Attempting to join with code:', normalizedCode);

    try {
      // Find the pending invite
      const { data: invite, error: findError } = await supabase
        .from('relationships')
        .select('*')
        .eq('invite_code', normalizedCode)
        .eq('status', 'pending')
        .is('dependent_id', null)
        .maybeSingle();

      console.log('[useRelationships] Find invite result:', { invite, findError });

      if (findError) {
        console.error('[useRelationships] Error finding invite:', findError);
        setError(findError.message);
        return { success: false, error: findError.message };
      }

      if (!invite) {
        const message = 'Invalid or expired invite code. Please check the code and try again.';
        console.log('[useRelationships] No invite found for code:', normalizedCode);
        setError(message);
        return { success: false, error: message };
      }

      console.log('[useRelationships] Found invite, updating with dependent_id:', user.id);

      // Update the relationship with dependent_id
      const { error: updateError } = await supabase
        .from('relationships')
        .update({
          dependent_id: user.id,
          status: 'active',
          invite_code: null, // Clear the code once used
        })
        .eq('id', invite.id);

      if (updateError) {
        console.error('[useRelationships] Error updating relationship:', updateError);
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      console.log('[useRelationships] Successfully joined guardian!');
      await fetchRelationships();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join';
      console.error('[useRelationships] Unexpected error:', err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [user, profile?.role, fetchRelationships]);

  /**
   * Accept a pending relationship (guardian only).
   */
  const acceptRelationship = useCallback(async (
    relationshipId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('relationships')
        .update({ status: 'active' })
        .eq('id', relationshipId)
        .eq('guardian_id', user.id);

      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      await fetchRelationships();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [user, fetchRelationships]);

  /**
   * Remove a relationship.
   */
  const removeRelationship = useCallback(async (
    relationshipId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not logged in' };
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('relationships')
        .update({ status: 'removed' })
        .eq('id', relationshipId);

      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      await fetchRelationships();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [user, fetchRelationships]);

  return {
    relationships,
    pendingInvites,
    loading,
    error,
    createInvite,
    joinWithCode,
    acceptRelationship,
    removeRelationship,
    refetch: fetchRelationships,
  };
}
