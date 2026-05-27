import { PixelBadge } from '@/components/shared/ui/pixel';
import type { NewsItem } from '@/lib/utils/editorial';

type BadgeTone = 'magenta' | 'cyan' | 'gold' | 'success' | 'danger' | 'default';

const TAG_TONE: Record<string, BadgeTone> = {
  OFICIAL: 'cyan',
  CLAVE: 'magenta',
  ASCENSO: 'success',
  ALERTA: 'danger',
  STREAM: 'gold',
};

/** Auto-generated announcement grid. */
export function NewsRail({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-4 font-pixel text-sm uppercase tracking-wider text-px-ink">
        Noticias
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-3 border-[3px] border-px-border bg-px-elev p-4"
          >
            <PixelBadge tone={TAG_TONE[item.tag] ?? 'default'}>
              {item.tag}
            </PixelBadge>
            <p className="font-retro text-lg leading-snug text-px-ink">
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
