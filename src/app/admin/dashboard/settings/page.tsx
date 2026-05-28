import { AdminCard } from '@/components/admin/ui';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-pixel text-lg uppercase tracking-wider text-px-gold">
        Configuración
      </h1>
      <AdminCard>
        <p className="font-retro text-lg text-px-ink-soft">
          Ajustes generales del panel de administración.
        </p>
      </AdminCard>
    </div>
  );
}
