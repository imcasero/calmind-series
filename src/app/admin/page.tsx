'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  AdminButton,
  AdminErrorBanner,
  AdminInput,
} from '@/components/admin/ui';
import { PixelLogo } from '@/components/shared/ui/pixel';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

export default function AdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
  };

  return (
    <div className="pixel-root flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="border-[3px] border-px-border bg-px-elev p-8 shadow-[6px_6px_0_0_var(--color-px-deep)]">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <PixelLogo size={40} />
            <h1 className="font-pixel text-lg uppercase tracking-wider text-px-ink">
              Admin Panel
            </h1>
            <div className="h-1 w-20 bg-px-gold" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <AdminInput
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
            <AdminInput
              id="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            {error && <AdminErrorBanner message={error} />}

            <AdminButton
              type="submit"
              tone="primary"
              disabled={loading}
              className="w-full justify-center"
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </AdminButton>
          </form>

          <p className="mt-6 text-center font-retro text-base text-px-ink-dim">
            Acceso restringido a administradores
          </p>
        </div>

        {/* Decorative pixels */}
        <div className="mt-4 flex justify-center gap-2">
          <span className="size-3 border-2 border-px-deep bg-px-gold" />
          <span className="size-3 border-2 border-px-deep bg-px-magenta" />
          <span className="size-3 border-2 border-px-deep bg-px-gold" />
        </div>
      </div>
    </div>
  );
}
