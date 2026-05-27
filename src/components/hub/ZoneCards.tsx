import { ZONES } from '@/lib/utils/standings';

const ZONE_COPY: Record<string, string> = {
  titulo: 'Posiciones 1–4. Acceso al playoff por el título de división.',
  neutral: 'Posiciones 5–6. Sin premio ni castigo directo al cierre.',
  exilio: 'Posiciones 7–8. Lucha por evitar el descenso en las finales.',
};

/** Three explainer cards for the standings zones. */
export function ZoneCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {ZONES.map((zone) => (
        <div
          key={zone.id}
          className="border-[3px] bg-px-elev p-4"
          style={{ borderColor: zone.color }}
        >
          <p
            className="mb-2 font-pixel text-xs uppercase tracking-wider"
            style={{ color: zone.color }}
          >
            {zone.label}
          </p>
          <p className="font-retro text-base text-px-ink-soft">
            {ZONE_COPY[zone.id]}
          </p>
        </div>
      ))}
    </div>
  );
}
