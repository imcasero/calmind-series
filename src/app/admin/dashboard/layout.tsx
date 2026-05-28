'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AdminButton } from '@/components/admin/ui';
import {
  PixelCrown,
  PixelDoc,
  PixelGear,
  PixelGem,
  PixelLightning,
  PixelOrb,
  PixelSword,
  PixelUsers,
} from '@/components/shared/ui/pixel';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

type IconComponent = (props: {
  size?: number;
  color?: string;
}) => React.ReactNode;

const navItems: { href: string; label: string; Icon: IconComponent }[] = [
  { href: '/admin/dashboard', label: 'Panel', Icon: PixelGem },
  { href: '/admin/dashboard/seasons', label: 'Temporadas', Icon: PixelCrown },
  { href: '/admin/dashboard/splits', label: 'Splits', Icon: PixelOrb },
  { href: '/admin/dashboard/divisions', label: 'Divisiones', Icon: PixelSword },
  {
    href: '/admin/dashboard/participants',
    label: 'Participantes',
    Icon: PixelUsers,
  },
  { href: '/admin/dashboard/matches', label: 'Partidos', Icon: PixelLightning },
  { href: '/admin/dashboard/normativa', label: 'Normativa', Icon: PixelDoc },
  {
    href: '/admin/dashboard/settings',
    label: 'Configuración',
    Icon: PixelGear,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await createBrowserClient().auth.signOut();
    if (!error) {
      router.push('/admin');
    }
    setLoggingOut(false);
  };

  const activeLabel =
    navItems.find((item) => item.href === pathname)?.label ?? 'Dashboard';

  return (
    <div className="pixel-root flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r-[3px] border-px-border bg-px-deep">
        {/* Logo/Header */}
        <div className="border-b-[3px] border-px-border p-6">
          <h1 className="font-pixel text-xs uppercase tracking-wider text-px-gold">
            Calmind Admin
          </h1>
          <p className="mt-1 font-retro text-sm text-px-ink-dim">
            Panel de Control
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 border-2 px-3 py-2.5 font-pixel text-[10px] uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'border-px-gold bg-px-gold text-px-deep'
                        : 'border-px-border text-px-ink-soft hover:border-px-border-hi hover:text-px-magenta'
                    }`}
                  >
                    <item.Icon
                      size={16}
                      color={
                        isActive
                          ? 'var(--color-px-deep)'
                          : 'var(--color-px-ink-soft)'
                      }
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t-[3px] border-px-border p-4">
          <AdminButton
            tone="danger"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full justify-center"
          >
            {loggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
          </AdminButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-px-base">
        {/* Top Bar */}
        <header className="border-b-[3px] border-px-border bg-px-deep px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-sm uppercase tracking-wider text-px-ink">
              {activeLabel}
            </h2>
            <div className="flex items-center gap-3">
              <span className="font-retro text-base text-px-ink-dim">
                Admin
              </span>
              <span className="grid size-8 place-items-center border-2 border-px-deep bg-px-gold font-pixel text-xs text-px-deep">
                A
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
