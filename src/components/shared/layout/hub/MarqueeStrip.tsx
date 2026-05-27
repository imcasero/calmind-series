interface MarqueeStripProps {
  items: string[];
}

/**
 * Scrolling status strip below the TopBar. Presentational (RSC-safe): the loop
 * is pure CSS (`.marquee-track` → translateX(-50%)), so the item sequence is
 * duplicated once for a seamless wrap. Content is built server-side.
 */
export function MarqueeStrip({ items }: MarqueeStripProps) {
  if (items.length === 0) {
    return null;
  }

  const loop = [...items, ...items].map((text, index) => ({
    id: `${index}-${text}`,
    text,
  }));

  return (
    <div className="overflow-hidden border-b-[3px] border-px-border bg-px-deep">
      <div className="marquee-track px-6 py-1.5">
        {loop.map((entry) => (
          <span
            key={entry.id}
            className="font-pixel text-[9px] uppercase tracking-widest text-px-ink-soft"
          >
            {entry.text}
          </span>
        ))}
      </div>
    </div>
  );
}
