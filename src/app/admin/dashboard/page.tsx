'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

export default function Dashboard() {
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const router = useRouter();

  const logout = async () => {
    const { error } = await createBrowserClient().auth.signOut();
    if (error) {
      setLogoutError(error.message);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1>Dashboard</h1>
      <button type="button" onClick={logout}>
        Logout
      </button>
      {logoutError && <p className="text-red-500">{logoutError}</p>}
    </div>
  );
}
