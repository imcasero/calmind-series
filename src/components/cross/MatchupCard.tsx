'use client';

import { motion } from 'motion/react';

interface Team {
  nickname: string;
  position: number;
  sets?: number; // Optional: sets won
  avatar_url?: string | null; // Optional: avatar URL
}

interface MatchupCardProps {
  home: Team;
  away: Team;
  matchTitle: string;
  accentColor?: string; // e.g., 'var(--color-retro-gold-400)'
  played?: boolean; // Optional: whether the match has been played
}

export const MatchupCard = ({
  home,
  away,
  matchTitle,
  accentColor = 'var(--color-retro-gold-400)',
  played = false,
}: MatchupCardProps) => {
  const homeWon = played && (home.sets ?? 0) > (away.sets ?? 0);
  const awayWon = played && (away.sets ?? 0) > (home.sets ?? 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="relative group overflow-hidden"
    >
      {/* HUD Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_4px)] z-10" />

      {/* Card Border and Background */}
      <div
        className="retro-border border-2 xs:border-3 bg-jacksons-purple-950/80 backdrop-blur-sm p-3 xs:p-4 transition-colors group-hover:bg-jacksons-purple-900/90"
        style={{ borderColor: `${accentColor}80` }}
      >
        {/* Match Header */}
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <div
            className="text-[10px] xs:text-xs uppercase tracking-[0.2em] font-black font-pokemon"
            style={{ color: accentColor }}
          >
            {matchTitle}
          </div>
          <div className="flex gap-1.5 opacity-30">
            <div className="w-1 h-1 rounded-full bg-white" />
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
        </div>

        <div className="space-y-3">
          {/* Home Team */}
          <div className="relative overflow-hidden rounded-sm group/team">
            <div
              className={`flex items-center justify-between bg-jacksons-purple-800/80 border px-3 py-2.5 transition-all group-hover/team:bg-jacksons-purple-700/90 ${
                homeWon
                  ? 'border-retro-gold-500/50 bg-retro-gold-500/10'
                  : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="font-black text-xs xs:text-sm w-6 h-6 flex items-center justify-center rounded-xs bg-black/40 border border-white/10"
                  style={{ color: accentColor }}
                >
                  #{home.position}
                </div>
                <span
                  className={`text-xs xs:text-sm font-pokemon tracking-tight truncate max-w-[140px] xs:max-w-[180px] ${
                    homeWon ? 'text-retro-gold-400 font-bold' : 'text-white'
                  }`}
                >
                  {home.nickname}
                </span>
              </div>

              {played && home.sets !== undefined && (
                <div
                  className={`font-black text-lg xs:text-xl ${
                    homeWon ? 'text-retro-gold-400' : 'text-white/40'
                  }`}
                >
                  {home.sets}
                </div>
              )}

              {/* Corner Accent */}
              <div
                className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 transition-opacity opacity-0 group-hover/team:opacity-100"
                style={{ borderColor: accentColor }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-white/5" />
            <div
              className={`text-center text-[10px] font-pokemon uppercase tracking-tighter ${
                played ? 'text-retro-gold-400' : 'text-white/20'
              }`}
            >
              {played ? 'FINAL' : 'VS'}
            </div>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {/* Away Team */}
          <div className="relative overflow-hidden rounded-sm group/team">
            <div
              className={`flex items-center justify-between bg-jacksons-purple-800/80 border px-3 py-2.5 transition-all group-hover/team:bg-jacksons-purple-700/90 ${
                awayWon
                  ? 'border-retro-gold-500/50 bg-retro-gold-500/10'
                  : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="font-black text-xs xs:text-sm w-6 h-6 flex items-center justify-center rounded-xs bg-black/40 border border-white/10"
                  style={{ color: accentColor }}
                >
                  #{away.position}
                </div>
                <span
                  className={`text-xs xs:text-sm font-pokemon tracking-tight truncate max-w-[140px] xs:max-w-[180px] ${
                    awayWon ? 'text-retro-gold-400 font-bold' : 'text-white'
                  }`}
                >
                  {away.nickname}
                </span>
              </div>

              {played && away.sets !== undefined && (
                <div
                  className={`font-black text-lg xs:text-xl ${
                    awayWon ? 'text-retro-gold-400' : 'text-white/40'
                  }`}
                >
                  {away.sets}
                </div>
              )}

              {/* Corner Accent */}
              <div
                className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 transition-opacity opacity-0 group-hover/team:opacity-100"
                style={{ borderColor: accentColor }}
              />
            </div>
          </div>
        </div>

        {/* HUD Details Footer */}
        <div className="mt-4 flex items-center justify-between opacity-20">
          <span className="text-[7px] font-mono tracking-widest uppercase">
            Encryption Active
          </span>
          <div className="flex gap-1">
            <div className="w-1.5 h-0.5 bg-white" />
            <div className="w-3 h-0.5 bg-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
