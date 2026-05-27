'use client';

import { useEffect, useState } from 'react';
import { MonsterSprite } from '@/components/shared/ui/pixel';

interface BattleScreenProps {
  attacker: string;
  defender: string;
}

/** Game Boy "battle" brand moment (README §Fidelity: keep as-is). Animated text. */
export function BattleScreen({ attacker, defender }: BattleScreenProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);

  const messages = [
    `¡${attacker.toUpperCase()} usa HYPERBEAM!`,
    'Es muy efectivo...',
    `${defender.toUpperCase()} -54 PV`,
    `¿Qué hará ${defender.toUpperCase()}?`,
  ];
  const variant = tick % messages.length;
  const defenderHp = Math.max(20, 60 - (tick % 4) * 10);

  return (
    <div
      className="flex h-full flex-col gap-2"
      style={{ color: '#9bbc0f', fontFamily: 'var(--font-pixel)', fontSize: 9 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <span style={{ color: '#0f380f' }}>
            {defender.toUpperCase()} Lv.68
          </span>
          <div
            style={{
              width: 100,
              height: 6,
              background: '#0f380f',
              border: '1px solid #0f380f',
            }}
          >
            <div
              style={{
                width: `${defenderHp}%`,
                height: '100%',
                background: '#9bbc0f',
              }}
            />
          </div>
        </div>
        <MonsterSprite size={56} variant={2} color="#9bbc0f" />
      </div>

      <div className="flex-1" />

      <div className="flex items-end justify-between">
        <MonsterSprite size={56} variant={0} color="#9bbc0f" />
        <div className="flex flex-col items-end gap-2">
          <span style={{ color: '#0f380f' }}>
            {attacker.toUpperCase()} Lv.71
          </span>
          <div
            style={{
              width: 100,
              height: 6,
              background: '#0f380f',
              border: '1px solid #0f380f',
            }}
          >
            <div
              style={{ width: '82%', height: '100%', background: '#9bbc0f' }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#0f380f',
          border: '2px solid #9bbc0f',
          padding: '6px 8px',
          minHeight: 36,
          color: '#9bbc0f',
        }}
      >
        <span className="blink">►</span> {messages[variant]}
      </div>
    </div>
  );
}
