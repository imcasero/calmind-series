interface HubPageHeaderProps {
  eyebrow?: string;
  title: string;
}

/** Shared redesign page header (eyebrow + pixel title). Reused across FR4–FR9. */
export function HubPageHeader({ eyebrow, title }: HubPageHeaderProps) {
  return (
    <header className="mb-8 border-b-[3px] border-px-border pb-5">
      {eyebrow && (
        <p className="mb-2 font-pixel text-[10px] uppercase tracking-[0.2em] text-px-magenta">
          {eyebrow}
        </p>
      )}
      <h1 className="font-pixel text-2xl uppercase text-px-ink sm:text-3xl">
        {title}
      </h1>
    </header>
  );
}
