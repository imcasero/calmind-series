import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config/env';

export async function proxy(request: NextRequest) {
  // Crear respuesta para poder modificar cookies
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Crear cliente de Supabase para el middleware
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Verificar si es una ruta de admin
  const isAdminRoute = pathname.startsWith('/admin');
  // La página /admin es pública (página de login)
  const isAdminLoginPage = pathname === '/admin';

  // Si es una ruta de admin pero NO es la página de login
  if (isAdminRoute && !isAdminLoginPage) {
    // Si no está autenticado, redirigir a /admin
    if (!user) {
      const redirectUrl = new URL('/admin', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
