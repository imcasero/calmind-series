'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login attempt:', { email, password });
      redirect('/admin/dashboard');
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const pixel3dEffect = {
    base: 'shadow-[4px_4px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(255,255,255,0.3),inset_-2px_-2px_0px_rgba(0,0,0,0.2)]',
    hover:
      'hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(255,255,255,0.3),inset_-2px_-2px_0px_rgba(0,0,0,0.2)]',
    active:
      'active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#1a1a1a,inset_2px_2px_0px_rgba(0,0,0,0.2),inset_-2px_-2px_0px_rgba(255,255,255,0.1)]',
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 w-3/4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div
          className={`
            bg-jacksons-purple-600 
            border-4 border-[#1a1a1a] 
            ${pixel3dEffect.base}
            p-8
          `}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">
              Admin Panel
            </h1>
            <div className="h-1 w-20 bg-retro-gold-500 mx-auto"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-white font-bold uppercase text-sm mb-2 tracking-wide"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`
                  w-full px-4 py-3 
                  bg-jacksons-purple-950 
                  text-white 
                  border-4 border-[#1a1a1a]
                  focus:outline-none focus:border-retro-gold-500
                  transition-all duration-150
                  placeholder-jacksons-purple-400
                  ${pixel3dEffect.base}
                `}
                placeholder="tu@email.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-white font-bold uppercase text-sm mb-2 tracking-wide"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`
                  w-full px-4 py-3 
                  bg-jacksons-purple-950 
                  text-white 
                  border-4 border-[#1a1a1a]
                  focus:outline-none focus:border-retro-gold-500
                  transition-all duration-150
                  placeholder-jacksons-purple-400
                  ${pixel3dEffect.base}
                `}
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-600 border-4 border-[#1a1a1a] px-4 py-2 text-white text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full
                px-8 py-4
                bg-retro-gold-500 
                text-jacksons-purple-950
                border-4 border-[#1a1a1a]
                font-bold uppercase tracking-wider
                cursor-pointer
                transition-all duration-100
                disabled:opacity-50 disabled:cursor-not-allowed
                ${pixel3dEffect.base}
                ${!loading && pixel3dEffect.hover}
                ${!loading && pixel3dEffect.active}
              `}
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-jacksons-purple-200 text-sm">
              Acceso restringido a administradores
            </p>
          </div>
        </div>

        {/* Decorative pixels below card */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-3 h-3 bg-retro-gold-500 border-2 border-[#1a1a1a]"></div>
          <div className="w-3 h-3 bg-snuff-500 border-2 border-[#1a1a1a]"></div>
          <div className="w-3 h-3 bg-retro-gold-500 border-2 border-[#1a1a1a]"></div>
        </div>
      </div>
    </div>
  );
}
