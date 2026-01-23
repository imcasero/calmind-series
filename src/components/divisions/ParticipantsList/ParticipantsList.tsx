'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import type { ParticipantsByDivision } from '@/lib/types/queries.types';

interface ParticipantsListProps {
  participants: ParticipantsByDivision;
}

const MAX_LIVES = 20;

function HPBar({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100;

  // Classic Pokemon HP Bar colors
  const barColor =
    percentage > 50
      ? 'bg-[#4ade80]' // Green
      : percentage > 20
        ? 'bg-[#fbbf24]' // Yellow/Orange
        : 'bg-[#f87171]'; // Red

  return (
    <div className="w-full h-2 bg-black/40 border border-black/60 rounded-full relative overflow-hidden flex items-center shadow-inner">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full ${barColor} shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]`}
      />
    </div>
  );
}

function LivesDisplay({ lives }: { lives: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3 h-3 text-red-500 drop-shadow-[0_0_2px_rgba(239,68,68,0.5)]"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.32 4.433 3.25 7.5 3.25c1.64 0 3.161.82 4.128 2.064 1.258-1.623 3.664-2.22 5.518-1.673 2.502.738 4.604 3.016 4.604 5.922 0 3.908-2.32 6.945-4.8 8.892-1.397 1.1-2.903 1.944-4.244 2.456-.4.152-.782.269-1.071.341l-.066.015-.008.002-.001.001h-.001z" />
          </svg>
          <span className="text-white font-black text-[10px] tracking-tighter font-mono italic">
            HP: {lives}
            <span className="text-white/30 font-normal ml-1">
              / {MAX_LIVES}
            </span>
          </span>
        </div>
      </div>
      <HPBar current={lives} max={MAX_LIVES} />
    </div>
  );
}

function PokedexCard({
  nickname,
  avatarUrl,
  lives,
  index,
  isActive,
}: {
  nickname: string;
  avatarUrl: string | null;
  lives: number;
  index: number;
  isActive: boolean;
}) {
  const initials = nickname.slice(0, 2).toUpperCase();
  const trainerNumber = String(index + 1).padStart(3, '0');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isActive ? 1 : 0.6,
        scale: isActive ? 1 : 0.9,
      }}
      className={`flex-shrink-0 w-40 xs:w-44 ${isActive ? 'z-20' : 'z-0'}`}
    >
      <div
        className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}
      >
        {/* Card Frame - Using Theme Colors */}
        <div
          className={`bg-jacksons-purple-950 border-2 ${isActive ? 'border-white/20' : 'border-white/5'} rounded-sm p-0.5 shadow-xl`}
        >
          <div
            className={`p-2.5 bg-jacksons-purple-800 border ${isActive ? 'border-retro-gold-500/30' : 'border-white/5'} space-y-2.5`}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <span className="text-white/40 text-[9px] font-mono font-bold">
                #{trainerNumber}
              </span>
              <div className="flex gap-1">
                <div
                  className={`w-1.5 h-1.5 rounded-sm ${isActive ? 'bg-retro-cyan-400' : 'bg-retro-cyan-900'}`}
                />
                <div className="w-1.5 h-1.5 rounded-sm bg-snuff-500/40" />
              </div>
            </div>

            {/* Avatar Frame - SoulSilver Influenced */}
            <div className="bg-black/80 border border-black/40 p-0.5 rounded-sm relative overflow-hidden group">
              <div className="aspect-square relative flex items-center justify-center overflow-hidden rounded-sm">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={nickname}
                    width={140}
                    height={140}
                    className={`w-full h-full object-cover transition-all duration-300 ${isActive ? 'brightness-110 contrast-110' : 'brightness-50 grayscale contrast-75'}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-white/10 font-mono">
                    {initials}
                  </div>
                )}

                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,white_2px,white_4px)]" />
              </div>

              {/* Corner Brackets */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/30" />
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/30" />
            </div>

            {/* Name and Stats */}
            <div className="space-y-2">
              <div className="bg-jacksons-purple-900 border border-white/5 py-1 px-2 rounded-sm overflow-hidden text-center">
                <h4 className="text-retro-gold-400 font-bold text-[10px] uppercase truncate font-mono tracking-tight">
                  {nickname}
                </h4>
              </div>
              <LivesDisplay lives={lives} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RetroNavButton({
  direction,
  onClick,
  disabled,
  color,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
  color: 'gold' | 'cyan';
}) {
  const icon = direction === 'left' ? '◀' : '▶';
  const accentBorder =
    color === 'gold' ? 'border-retro-gold-500' : 'border-retro-cyan-400';
  const accentText =
    color === 'gold' ? 'text-retro-gold-400' : 'text-retro-cyan-300';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={
        !disabled
          ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }
          : {}
      }
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`w-10 h-10 flex items-center justify-center border-2 bg-jacksons-purple-950 transition-all duration-200 ${
        disabled
          ? 'border-white/5 text-white/5 cursor-not-allowed opacity-30 shadow-none'
          : `${accentBorder} ${accentText} cursor-pointer shadow-lg`
      }`}
    >
      <span className="text-xl font-mono">{icon}</span>
    </motion.button>
  );
}

function DivisionCarousel({
  title,
  participants,
  color,
}: {
  title: string;
  participants: ParticipantsByDivision['primera'];
  color: 'gold' | 'cyan';
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const titleColor =
    color === 'gold' ? 'text-retro-gold-400' : 'text-retro-cyan-300';
  const borderColor =
    color === 'gold' ? 'border-retro-gold-500' : 'border-retro-cyan-500';

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < participants.length - 1;

  const scrollToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, participants.length - 1));
    setActiveIndex(clampedIndex);

    if (scrollRef.current) {
      const container = scrollRef.current;
      const cards = container.querySelectorAll('[data-card]');
      const targetCard = cards[clampedIndex] as HTMLElement;

      if (targetCard) {
        const containerRect = container.getBoundingClientRect();
        const cardRect = targetCard.getBoundingClientRect();
        const scrollLeft =
          container.scrollLeft +
          (cardRect.left - containerRect.left) -
          containerRect.width / 2 +
          cardRect.width / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  };

  if (participants.length === 0) {
    return (
      <section className="animate-in fade-in duration-500">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-3 h-3 ${color === 'gold' ? 'bg-retro-gold-500' : 'bg-retro-cyan-500'}`}
          />
          <h3
            className={`${titleColor} font-black text-xs uppercase tracking-widest`}
          >
            {title}
          </h3>
        </div>
        <div className="border-2 border-white/5 bg-jacksons-purple-950 p-4 text-center italic text-white/20 font-mono text-[10px] uppercase">
          Sector Offline
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      {/* Container - Reduced Padding & Theme Colors */}
      <div
        className={`border-[3px] ${borderColor} bg-jacksons-purple-950 px-1 py-4 sm:px-2 sm:py-6 rounded-sm overflow-hidden relative group shadow-2xl`}
      >
        {/* Background Detail */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[20px_20px]" />

        <div className="relative space-y-4">
          {/* Header - Restored Pokéball Style */}
          <div className="flex flex-col items-center gap-1 mb-4">
            <div className="flex items-center gap-4">
              {/* Pokéball Icon Left */}
              <div
                className={`w-5 h-5 rounded-full border-2 ${borderColor} bg-linear-to-b from-white to-gray-300 relative overflow-hidden shadow-lg`}
              >
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1/2 ${color === 'gold' ? 'bg-retro-gold-500' : 'bg-jacksons-purple-500'}`}
                />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white border border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
              </div>

              <h3
                className={`${titleColor} font-black text-2xl sm:text-4xl uppercase tracking-widest text-center drop-shadow-[0_2px_0_rgba(0,0,0,1)]`}
              >
                {title}
              </h3>

              {/* Pokéball Icon Right */}
              <div
                className={`w-5 h-5 rounded-full border-2 ${borderColor} bg-linear-to-b from-white to-gray-300 relative overflow-hidden shadow-lg`}
              >
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1/2 ${color === 'gold' ? 'bg-retro-gold-500' : 'bg-jacksons-purple-500'}`}
                />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-jacksons-purple-900 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-white border border-jacksons-purple-900 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex items-center gap-4 opacity-40">
              <span className="text-[8px] font-mono font-bold tracking-[0.2em] uppercase">
                Sector Active
              </span>
              <div className="w-1 h-1 rounded-full bg-white/50" />
              <span className="text-[8px] font-mono font-bold tracking-[0.2em] uppercase">
                N. [{participants.length}]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <RetroNavButton
              direction="left"
              color={color}
              disabled={!canGoPrev}
              onClick={() => scrollToIndex(activeIndex - 1)}
            />

            <div className="flex-1 min-w-0 overflow-hidden relative">
              <div
                ref={scrollRef}
                className="overflow-x-auto scrollbar-hide flex snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-3 sm:gap-4 px-[10%]">
                  {participants.map((p, index) => (
                    <button
                      key={p.trainerId}
                      type="button"
                      data-card
                      onClick={() => scrollToIndex(index)}
                      className="snap-center cursor-pointer outline-none focus-visible:ring-1 ring-white/20"
                    >
                      <PokedexCard
                        nickname={p.nickname}
                        avatarUrl={p.avatarUrl}
                        lives={p.lives}
                        index={index}
                        isActive={index === activeIndex}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fade Edges */}
              <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-jacksons-purple-950 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-jacksons-purple-950 to-transparent pointer-events-none z-10" />
            </div>

            <RetroNavButton
              direction="right"
              color={color}
              disabled={!canGoNext}
              onClick={() => scrollToIndex(activeIndex + 1)}
            />
          </div>

          {/* Dots Indicator */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="flex gap-1.5 min-w-0 max-w-full overflow-x-auto no-scrollbar py-1">
              {participants.map((p, idx) => (
                <button
                  key={p.trainerId}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  className={`h-0.5 transition-all duration-300 ${
                    idx === activeIndex
                      ? `w-8 ${color === 'gold' ? 'bg-retro-gold-400' : 'bg-retro-cyan-400'}`
                      : 'w-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ParticipantsList({
  participants,
}: ParticipantsListProps) {
  return (
    <div className="space-y-8">
      <DivisionCarousel
        title="Primera División"
        participants={participants.primera}
        color="gold"
      />
      <DivisionCarousel
        title="Segunda División"
        participants={participants.segunda}
        color="cyan"
      />
    </div>
  );
}
