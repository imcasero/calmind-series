import { z } from 'zod';

// --- Database Raw Schemas ---

export const SeasonSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  year: z.number(),
  is_active: z.boolean().nullable(),
  created_at: z.string().nullable(),
});

export const SplitSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  season_id: z.string().uuid().nullable(),
  is_active: z.boolean().nullable(),
  split_order: z.number(),
  created_at: z.string().nullable(),
});

export const LeagueSchema = z.object({
  id: z.string().uuid(),
  split_id: z.string().uuid().nullable(),
  tier_name: z.string(),
  tier_priority: z.number(),
  created_at: z.string().nullable(),
});

export const TrainerSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string(),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const MatchSchema = z.object({
  id: z.string().uuid(),
  split_id: z.string().uuid().nullable(),
  league_id: z.string().uuid().nullable(),
  round: z.number(),
  match_group: z.string(),
  match_tag: z.string(),
  home_trainer_id: z.string().uuid().nullable(),
  away_trainer_id: z.string().uuid().nullable(),
  home_sets: z.number().nullable(),
  away_sets: z.number().nullable(),
  played: z.boolean().nullable(),
  metadata: z.any().nullable(),
  created_at: z.string().nullable(),
});

export const LeagueRankingSchema = z.object({
  league_id: z.string().uuid().nullable(),
  trainer_id: z.string().uuid().nullable(),
  nickname: z.string().nullable(),
  avatar_url: z.string().nullable(),
  position: z.number().nullable(),
  total_points: z.number().nullable(),
  total_sets_won: z.number().nullable(),
  set_balance: z.number().nullable(),
  matches_played: z.number().nullable(),
});

// --- UI / Formatted Schemas ---

export const RankingEntrySchema = z.object({
  position: z.number(),
  nickname: z.string(),
  totalPoints: z.number(),
  avatarUrl: z.string().nullable(),
  setBalance: z.number(),
  matchesPlayed: z.number(),
  totalSetsWon: z.number(),
  trainerId: z.string(),
});

export const LeagueInfoSchema = LeagueSchema.pick({
  id: true,
  tier_name: true,
  tier_priority: true,
});

export const ParticipantEntrySchema = z.object({
  trainerId: z.string().uuid(),
  nickname: z.string(),
  avatarUrl: z.string().nullable(),
});

export const MatchTrainerSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string(),
  avatarUrl: z.string().nullable(),
});

export const MatchEntrySchema = z.object({
  id: z.string().uuid(),
  round: z.number(),
  matchGroup: z.string(),
  matchTag: z.string(),
  played: z.boolean(),
  homeSets: z.number(),
  awaySets: z.number(),
  homeTrainer: MatchTrainerSchema.nullable(),
  awayTrainer: MatchTrainerSchema.nullable(),
  leagueId: z.string().uuid().nullable(),
  leagueTierName: z.string().nullable(),
});

export const SeasonWithActiveSplitSchema = SeasonSchema.extend({
  activeSplit: SplitSchema.nullable(),
});

export const SeasonWithSplitsSchema = SeasonSchema.extend({
  splits: z.array(SplitSchema),
});

export const DivisionPreviewSchema = z.object({
  primera: z.array(RankingEntrySchema),
  segunda: z.array(RankingEntrySchema),
});

export const ParticipantsByDivisionSchema = z.object({
  primera: z.array(ParticipantEntrySchema),
  segunda: z.array(ParticipantEntrySchema),
});

export const MatchesByRoundSchema = z.array(
  z.object({
    round: z.number(),
    matches: z.array(MatchEntrySchema),
  }),
);

// --- Derived Types ---
export type RankingEntry = z.infer<typeof RankingEntrySchema>;
export type LeagueInfo = z.infer<typeof LeagueInfoSchema>;
export type ParticipantEntry = z.infer<typeof ParticipantEntrySchema>;
export type MatchEntry = z.infer<typeof MatchEntrySchema>;
export type MatchTrainer = z.infer<typeof MatchTrainerSchema>;
export type SeasonWithActiveSplit = z.infer<typeof SeasonWithActiveSplitSchema>;
export type SeasonWithSplits = z.infer<typeof SeasonWithSplitsSchema>;
export type DivisionPreview = z.infer<typeof DivisionPreviewSchema>;
export type ParticipantsByDivision = z.infer<
  typeof ParticipantsByDivisionSchema
>;
export type MatchesByRound = z.infer<typeof MatchesByRoundSchema>;
