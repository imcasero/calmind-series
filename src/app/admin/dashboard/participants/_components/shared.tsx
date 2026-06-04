'use client';

import { cn } from '@/lib/utils';

export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center border-[3px] px-5 py-3 font-pixel text-[10px] uppercase tracking-wider transition-colors',
        active
          ? 'border-px-gold bg-px-gold text-px-deep'
          : 'border-px-border bg-px-elev text-px-ink-soft hover:border-px-border-hi',
      )}
    >
      {children}
    </button>
  );
}

export function SelectorField({
  label,
  value,
  onChange,
  disabled = false,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="pixel-input w-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>
    </div>
  );
}

export function TrainerAvatar({
  url,
  nickname,
  small = false,
}: {
  url: string | null;
  nickname: string;
  small?: boolean;
}) {
  const sizeClass = small ? 'size-8' : 'size-10';
  if (url) {
    return (
      <img
        src={url}
        alt={nickname}
        className={cn('border-2 border-px-border object-cover', sizeClass)}
      />
    );
  }
  return (
    <div
      className={cn(
        'grid place-items-center border-2 border-px-border bg-px-deep font-pixel text-xs text-px-ink',
        sizeClass,
      )}
    >
      {nickname.charAt(0).toUpperCase()}
    </div>
  );
}

export function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="border-[3px] border-px-border bg-px-elev p-8 text-center shadow-[4px_4px_0_0_var(--color-px-deep)]">
      <p className="font-retro text-lg text-px-ink-dim">{text}</p>
    </div>
  );
}
