import { createClient } from '@/lib/supabase/server';
import NormattivaManager from './_components/NormattivaManager';

export default async function NormattivaPage() {
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

  return <NormattivaManager currentPdfUrl={currentPdfUrl} />;
}
