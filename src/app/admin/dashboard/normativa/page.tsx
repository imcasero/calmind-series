import { createClient } from '@/lib/supabase/server';
import RegulationsManager from './_components/RegulationsManager';

export default async function RegulationsPage() {
  const supabase = await createClient();

  const { data: publicData } = supabase.storage
    .from('normativas')
    .getPublicUrl('public/normativa_pokemon_calmind_series.pdf');

  let currentPdfUrl: string | null = null;

  try {
    const response = await fetch(publicData.publicUrl, { method: 'HEAD' });
    if (response.ok) {
      currentPdfUrl = publicData.publicUrl;
    }
  } catch (error) {
    console.error('Error al obtener la URL del PDF:', error);
  }

  return <RegulationsManager currentPdfUrl={currentPdfUrl} />;
}
