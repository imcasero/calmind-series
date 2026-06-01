import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/config/env';
import type { Database } from '@/lib/types/database.types';

interface CreateClientOptions {
  /**
   * When set to `false`, the client is built without ever reading `cookies()`.
   * This is required for paths that must remain statically renderable in Next 16
   * (e.g. archive routes prerendered at build time via `generateStaticParams`).
   * The default (session-aware) variant is used by every other RSC + admin
   * Server Action.
   */
  session?: false;
}

export async function createClient(
  options?: CreateClientOptions,
): Promise<ReturnType<typeof createServerClient<Database>>> {
  if (options?.session === false) {
    // Cookie-free variant — never invokes `next/headers` `cookies()`, so the
    // calling Server Component stays eligible for static prerender.
    return createServerClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {
            // No-op: there is no request cookie store to write back to.
          },
        },
      },
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored because `src/proxy.ts` (middleware replacement)
            // is handling the session refresh and cookie setting.
          }
        },
      },
    },
  );
}
