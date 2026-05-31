import { cacheLife, cacheTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface TrainerProfileInfo {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  bio: string | null;
}

/**
 * Gets a single trainer's profile fields. Trainers only have nickname/avatar/bio
 * (no ELO/region/real-name) — see the locked redesign decision (2026-05-27).
 */
export async function getTrainerById(
  trainerId: string,
): Promise<TrainerProfileInfo | null> {
  'use cache';
  cacheLife('hours');
  cacheTag('trainers');

  const supabase = await createClient({ session: false });

  const { data, error } = await supabase
    .from('trainers')
    .select('id, nickname, avatar_url, bio')
    .eq('id', trainerId)
    .maybeSingle();

  if (error) {
    console.error('[getTrainerById] Error:', error.message);
    return null;
  }
  if (!data) {
    return null;
  }

  const row = data as {
    id: string;
    nickname: string;
    avatar_url: string | null;
    bio: string | null;
  };

  return {
    id: row.id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    bio: row.bio,
  };
}
