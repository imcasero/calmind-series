'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  type MatchPlanningInput,
  MatchPlanningInputSchema,
  type MatchResultInput,
  MatchResultInputSchema,
} from '@/lib/types/schemas';

type ActionResult = { ok: true } | { ok: false; error: string };

type CreateResult = { ok: true; id: string } | { ok: false; error: string };

type GenerateResult =
  | { ok: true; createdCount: number }
  | { ok: false; error: string };

const DASHBOARD_PATH = '/admin/dashboard/matches';
const IdSchema = z.string().uuid('ID inválido');

const SplitLeagueCtxSchema = z.object({
  splitId: IdSchema,
  leagueId: IdSchema,
});

function formatZodIssues(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(' · ');
}

function bustMatchTags(splitId: string, leagueId?: string) {
  updateTag(`matches:${splitId}`);
  updateTag(`bracket:${splitId}`);
  if (leagueId) updateTag(`rankings:${leagueId}`);
}

export async function saveMatchResultAction(
  matchId: string,
  input: MatchResultInput,
  ctx: { splitId: string; leagueId: string },
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(matchId);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }
  const parsedCtx = SplitLeagueCtxSchema.safeParse(ctx);
  if (!parsedCtx.success) {
    return { ok: false, error: formatZodIssues(parsedCtx.error) };
  }
  const parsed = MatchResultInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('matches')
    .update({ ...parsed.data, played: true })
    .eq('id', parsedId.data);

  if (error) {
    console.error('[saveMatchResultAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  bustMatchTags(parsedCtx.data.splitId, parsedCtx.data.leagueId);
  return { ok: true };
}

export async function clearMatchResultAction(
  matchId: string,
  ctx: { splitId: string; leagueId: string },
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(matchId);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }
  const parsedCtx = SplitLeagueCtxSchema.safeParse(ctx);
  if (!parsedCtx.success) {
    return { ok: false, error: formatZodIssues(parsedCtx.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('matches')
    .update({ home_sets: null, away_sets: null, played: false })
    .eq('id', parsedId.data);

  if (error) {
    console.error('[clearMatchResultAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  bustMatchTags(parsedCtx.data.splitId, parsedCtx.data.leagueId);
  return { ok: true };
}

const CreateMatchSchema = z.object({
  leagueId: IdSchema,
  splitId: IdSchema,
  input: MatchPlanningInputSchema,
});

export async function createMatchAction(args: {
  leagueId: string;
  splitId: string;
  input: MatchPlanningInput;
}): Promise<CreateResult> {
  const parsed = CreateMatchSchema.safeParse(args);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('matches')
    .insert({
      league_id: parsed.data.leagueId,
      split_id: parsed.data.splitId,
      ...parsed.data.input,
      played: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[createMatchAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  // No leagueId-specific rankings bust on plain plan (no result yet).
  updateTag(`matches:${parsed.data.splitId}`);
  updateTag(`bracket:${parsed.data.splitId}`);
  return { ok: true, id: data.id };
}

export async function updateMatchAction(
  id: string,
  input: MatchPlanningInput,
  ctx: { splitId: string; leagueId: string },
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }
  const parsedCtx = SplitLeagueCtxSchema.safeParse(ctx);
  if (!parsedCtx.success) {
    return { ok: false, error: formatZodIssues(parsedCtx.error) };
  }
  const parsed = MatchPlanningInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodIssues(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('matches')
    .update(parsed.data)
    .eq('id', parsedId.data);

  if (error) {
    console.error('[updateMatchAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag(`matches:${parsedCtx.data.splitId}`);
  updateTag(`bracket:${parsedCtx.data.splitId}`);
  return { ok: true };
}

export async function deleteMatchAction(
  matchId: string,
  ctx: { splitId: string; leagueId: string },
): Promise<ActionResult> {
  const parsedId = IdSchema.safeParse(matchId);
  if (!parsedId.success) {
    return { ok: false, error: formatZodIssues(parsedId.error) };
  }
  const parsedCtx = SplitLeagueCtxSchema.safeParse(ctx);
  if (!parsedCtx.success) {
    return { ok: false, error: formatZodIssues(parsedCtx.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', parsedId.data);

  if (error) {
    console.error('[deleteMatchAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  bustMatchTags(parsedCtx.data.splitId, parsedCtx.data.leagueId);
  return { ok: true };
}

export async function generateJ15MatchesAction(
  leagueId: string,
  splitId: string,
): Promise<GenerateResult> {
  const parsedLeague = IdSchema.safeParse(leagueId);
  if (!parsedLeague.success) {
    return { ok: false, error: formatZodIssues(parsedLeague.error) };
  }
  const parsedSplit = IdSchema.safeParse(splitId);
  if (!parsedSplit.success) {
    return { ok: false, error: formatZodIssues(parsedSplit.error) };
  }

  const supabase = await createClient();

  const { data: rankings, error: rankingsError } = await supabase
    .from('league_rankings')
    .select('trainer_id, position, nickname')
    .eq('league_id', parsedLeague.data)
    .not('position', 'is', null)
    .order('position', { ascending: true })
    .limit(8);

  if (rankingsError) {
    console.error('[generateJ15MatchesAction] Error:', rankingsError);
    return { ok: false, error: rankingsError.message };
  }

  const rows = rankings ?? [];
  if (rows.length < 8) {
    return {
      ok: false,
      error:
        'Se necesitan al menos 8 participantes con posición en el ranking.',
    };
  }

  for (let i = 0; i < 8; i++) {
    if (!rows[i].trainer_id) {
      return {
        ok: false,
        error: `El participante en posición ${i + 1} no tiene trainer_id válido.`,
      };
    }
  }

  const matchesToCreate = [
    {
      league_id: parsedLeague.data,
      split_id: parsedSplit.data,
      round: 15,
      match_group: 'top_4',
      match_tag: 'semi_1',
      home_trainer_id: rows[0].trainer_id,
      away_trainer_id: rows[3].trainer_id,
      played: false,
    },
    {
      league_id: parsedLeague.data,
      split_id: parsedSplit.data,
      round: 15,
      match_group: 'top_4',
      match_tag: 'semi_2',
      home_trainer_id: rows[1].trainer_id,
      away_trainer_id: rows[2].trainer_id,
      played: false,
    },
    {
      league_id: parsedLeague.data,
      split_id: parsedSplit.data,
      round: 15,
      match_group: 'bottom_4',
      match_tag: 'survival_1',
      home_trainer_id: rows[4].trainer_id,
      away_trainer_id: rows[7].trainer_id,
      played: false,
    },
    {
      league_id: parsedLeague.data,
      split_id: parsedSplit.data,
      round: 15,
      match_group: 'bottom_4',
      match_tag: 'survival_2',
      home_trainer_id: rows[5].trainer_id,
      away_trainer_id: rows[6].trainer_id,
      played: false,
    },
  ];

  const { error } = await supabase.from('matches').insert(matchesToCreate);
  if (error) {
    console.error('[generateJ15MatchesAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag(`matches:${parsedSplit.data}`);
  updateTag(`bracket:${parsedSplit.data}`);
  return { ok: true, createdCount: matchesToCreate.length };
}

type J15Row = {
  id: string;
  match_tag: string;
  played: boolean | null;
  home_trainer_id: string | null;
  away_trainer_id: string | null;
  home_sets: number | null;
  away_sets: number | null;
};

function getMatchOutcome(
  match: J15Row,
  type: 'winner' | 'loser',
): string | null {
  if (!match.played) return null;
  const homeWins = (match.home_sets || 0) > (match.away_sets || 0);
  if (type === 'winner') {
    return homeWins ? match.home_trainer_id : match.away_trainer_id;
  }
  return homeWins ? match.away_trainer_id : match.home_trainer_id;
}

export async function generateJ16MatchesAction(
  leagueId: string,
  splitId: string,
): Promise<GenerateResult> {
  const parsedLeague = IdSchema.safeParse(leagueId);
  if (!parsedLeague.success) {
    return { ok: false, error: formatZodIssues(parsedLeague.error) };
  }
  const parsedSplit = IdSchema.safeParse(splitId);
  if (!parsedSplit.success) {
    return { ok: false, error: formatZodIssues(parsedSplit.error) };
  }

  const supabase = await createClient();

  // Look up the league tier server-side (the client previously derived it
  // from the in-memory `leagues` array via `getLeagueTier`).
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .select('tier_priority')
    .eq('id', parsedLeague.data)
    .single();

  if (leagueError || !league) {
    console.error('[generateJ16MatchesAction] Error:', leagueError);
    return {
      ok: false,
      error: leagueError?.message ?? 'No se encontró la liga.',
    };
  }
  const tier: 'primera' | 'segunda' =
    league.tier_priority === 1 ? 'primera' : 'segunda';

  const { data: j15Matches, error: j15Error } = await supabase
    .from('matches')
    .select(
      'id, match_tag, played, home_trainer_id, away_trainer_id, home_sets, away_sets',
    )
    .eq('league_id', parsedLeague.data)
    .eq('round', 15);

  if (j15Error) {
    console.error('[generateJ16MatchesAction] Error:', j15Error);
    return { ok: false, error: j15Error.message };
  }
  const rows = (j15Matches ?? []) as J15Row[];
  if (rows.length !== 4) {
    return {
      ok: false,
      error: 'No se encontraron los 4 partidos de J15 para esta liga.',
    };
  }

  const semi1 = rows.find((m) => m.match_tag === 'semi_1');
  const semi2 = rows.find((m) => m.match_tag === 'semi_2');
  const surv1 = rows.find((m) => m.match_tag === 'survival_1');
  const surv2 = rows.find((m) => m.match_tag === 'survival_2');

  if (!semi1 || !semi2 || !surv1 || !surv2) {
    return {
      ok: false,
      error: 'Faltan partidos de J15 (semi_1, semi_2, survival_1, survival_2)',
    };
  }

  const matchesToCreate =
    tier === 'primera'
      ? [
          {
            league_id: parsedLeague.data,
            split_id: parsedSplit.data,
            round: 16,
            match_group: 'top_4',
            match_tag: 'grand_final',
            home_trainer_id: getMatchOutcome(semi1, 'winner'),
            away_trainer_id: getMatchOutcome(semi2, 'winner'),
            played: false,
          },
          {
            league_id: parsedLeague.data,
            split_id: parsedSplit.data,
            round: 16,
            match_group: 'top_4',
            match_tag: '3rd_place',
            home_trainer_id: getMatchOutcome(semi1, 'loser'),
            away_trainer_id: getMatchOutcome(semi2, 'loser'),
            played: false,
          },
          {
            league_id: parsedLeague.data,
            split_id: parsedSplit.data,
            round: 16,
            match_group: 'bottom_4',
            match_tag: 'relegation_battle',
            home_trainer_id: getMatchOutcome(surv1, 'winner'),
            away_trainer_id: getMatchOutcome(surv2, 'winner'),
            played: false,
          },
          {
            league_id: parsedLeague.data,
            split_id: parsedSplit.data,
            round: 16,
            match_group: 'bottom_4',
            match_tag: 'honor_battle',
            home_trainer_id: getMatchOutcome(surv1, 'loser'),
            away_trainer_id: getMatchOutcome(surv2, 'loser'),
            played: false,
          },
        ]
      : [
          {
            league_id: parsedLeague.data,
            split_id: parsedSplit.data,
            round: 16,
            match_group: 'top_4',
            match_tag: 'segunda_final',
            home_trainer_id: getMatchOutcome(semi1, 'winner'),
            away_trainer_id: getMatchOutcome(semi2, 'winner'),
            played: false,
          },
          {
            league_id: parsedLeague.data,
            split_id: parsedSplit.data,
            round: 16,
            match_group: 'top_4',
            match_tag: 'opportunity',
            home_trainer_id: getMatchOutcome(semi1, 'loser'),
            away_trainer_id: getMatchOutcome(semi2, 'loser'),
            played: false,
          },
          {
            league_id: parsedLeague.data,
            split_id: parsedSplit.data,
            round: 16,
            match_group: 'bottom_4',
            match_tag: 'last_chance',
            home_trainer_id: getMatchOutcome(surv1, 'winner'),
            away_trainer_id: getMatchOutcome(surv2, 'winner'),
            played: false,
          },
          {
            league_id: parsedLeague.data,
            split_id: parsedSplit.data,
            round: 16,
            match_group: 'bottom_4',
            match_tag: 'honor_segunda',
            home_trainer_id: getMatchOutcome(surv1, 'loser'),
            away_trainer_id: getMatchOutcome(surv2, 'loser'),
            played: false,
          },
        ];

  const { error } = await supabase.from('matches').insert(matchesToCreate);
  if (error) {
    console.error('[generateJ16MatchesAction] Error:', error);
    return { ok: false, error: error.message };
  }

  revalidatePath(DASHBOARD_PATH);
  updateTag(`matches:${parsedSplit.data}`);
  updateTag(`bracket:${parsedSplit.data}`);
  return { ok: true, createdCount: matchesToCreate.length };
}
