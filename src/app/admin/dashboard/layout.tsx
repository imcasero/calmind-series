'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/admin/dashboard', label: 'Panel', icon: '📊' },
  { href: '/admin/dashboard/seasons', label: 'Temporadas', icon: '🏆' },
  { href: '/admin/dashboard/splits', label: 'Splits', icon: '📅' },
  { href: '/admin/dashboard/divisions', label: 'Divisiones', icon: '⚔️' },
  { href: '/admin/dashboard/participants', label: 'Participantes', icon: '👥' },
  { href: '/admin/dashboard/matches', label: 'Partidos', icon: '🎮' },
  { href: '/admin/dashboard/settings', label: 'Configuración', icon: '⚙️' },
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

  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <aside className="w-64 bg-jacksons-purple-950 border-r-4 border-jacksons-purple-700 flex flex-col shrink-0">
        {/* Logo/Header */}
        <div className="p-6 border-b-4 border-jacksons-purple-700">
          <h1 className="text-retro-gold-500 font-bold text-sm uppercase tracking-wider">
            Calmind Admin
          </h1>
          <p className="text-jacksons-purple-400 text-xs mt-1">
            Panel de Control
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3
                      text-sm font-medium uppercase tracking-wide
                      border-2 transition-all duration-150
                      ${
                        isActive
                          ? 'bg-retro-gold-500 text-jacksons-purple-950 border-jacksons-purple-950 shadow-[2px_2px_0px_0px_#1a1a1a]'
                          : 'bg-jacksons-purple-800 text-jacksons-purple-100 border-jacksons-purple-600 hover:bg-jacksons-purple-700 hover:border-retro-gold-500'
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t-4 border-jacksons-purple-700">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="
              w-full flex items-center justify-center gap-2 px-4 py-3
              bg-snuff-600 text-white
              text-sm font-medium uppercase tracking-wide
              border-2 border-jacksons-purple-950
              shadow-[2px_2px_0px_0px_#1a1a1a]
              hover:bg-snuff-500 transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <span>🚪</span>
            <span>{loggingOut ? 'Saliendo...' : 'Cerrar Sesión'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-jacksons-purple-900 overflow-auto">
        {/* Top Bar */}
        <header className="bg-jacksons-purple-800 border-b-4 border-jacksons-purple-600 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold uppercase tracking-wider">
              {navItems.find((item) => item.href === pathname)?.label ||
                'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-jacksons-purple-300 text-sm">Admin</span>
              <div className="w-8 h-8 bg-retro-gold-500 border-2 border-jacksons-purple-950 flex items-center justify-center">
                <span className="text-jacksons-purple-950 text-xs font-bold">
                  A
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
