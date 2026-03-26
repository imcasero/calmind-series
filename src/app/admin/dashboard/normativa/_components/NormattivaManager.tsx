'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NormattivaManagerProps {
  currentPdfUrl: string | null;
}

export default function NormattivaManager({
  currentPdfUrl,
}: NormattivaManagerProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(currentPdfUrl);

  const supabase = createClient();

  useEffect(() => {
    setCurrentUrl(currentPdfUrl);
  }, [currentPdfUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Por favor selecciona un archivo PDF');
        setFile(null);
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('El archivo es muy grande (máximo 50MB)');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor selecciona un archivo PDF');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Usar un nombre fijo para que siempre se sobrescriba
      const fileName = 'normativa_pokemon_calmind_series.pdf';

      // Subir a Supabase Storage (con upsert=true para sobrescribir)
      const { data, error: uploadError } = await supabase.storage
        .from('normativas')
        .upload(`public/${fileName}`, file, {
          cacheControl: '0', // No cachear para obtener la versión más reciente
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      if (!data) {
        throw new Error('No se pudo subir el archivo');
      }

      // Obtener la URL pública
      const { data: publicData } = supabase.storage
        .from('normativas')
        .getPublicUrl(`public/${fileName}`);

      const newUrl = publicData.publicUrl;

      setCurrentUrl(newUrl);
      setFile(null);
      setSuccess(true);
      // Limpiar el input
      const fileInput = document.getElementById(
        'pdf-upload',
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al subir el archivo',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-retro-gold-500 uppercase tracking-wider">
          Normativa Pokémon
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600 border-4 border-red-800 p-4 text-white text-sm">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-4 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-600 border-4 border-green-800 p-4 text-white text-sm">
          ✓ Normativa actualizada exitosamente
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="ml-4 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Upload Section */}
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a] space-y-4">
          <div>
            <label
              htmlFor="pdf-upload"
              className="block text-jacksons-purple-200 text-sm uppercase tracking-wide mb-2 font-bold"
            >
              Selecciona un archivo PDF
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-white
                file:mr-4 file:py-3 file:px-6
                file:border-4 file:border-jacksons-purple-950
                file:bg-retro-gold-500 file:text-jacksons-purple-950
                file:font-bold file:uppercase file:tracking-wide
                file:cursor-pointer file:shadow-[2px_2px_0px_0px_#1a1a1a]
                file:hover:translate-x-0.5 file:hover:translate-y-0.5
                file:hover:shadow-[1px_1px_0px_0px_#1a1a1a]
                file:disabled:opacity-50 file:disabled:cursor-not-allowed
                file:transition-all file:duration-100
                bg-jacksons-purple-950 border-4 border-jacksons-purple-600"
            />
            {file && (
              <div className="mt-3 p-3 bg-jacksons-purple-700 border-2 border-jacksons-purple-600 rounded text-jacksons-purple-100 text-sm">
                <strong>Archivo seleccionado:</strong> {file.name}
                <br />
                <strong>Tamaño:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className={`
              w-full px-8 py-4
              bg-retro-gold-500
              text-jacksons-purple-950
              border-4 border-jacksons-purple-950
              font-bold uppercase tracking-wider
              cursor-pointer
              transition-all duration-100
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-[4px_4px_0px_0px_#1a1a1a]
              hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a1a1a]
              active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#1a1a1a]
            `}
          >
            {uploading ? 'Subiendo...' : '📤 Subir Normativa'}
          </button>
        </div>
      </form>

      {/* Current PDF Info */}
      {currentUrl && (
        <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a] space-y-4">
          <h2 className="text-lg font-bold text-retro-gold-500 uppercase tracking-wider">
            📄 Normativa Actual
          </h2>
          <p className="text-jacksons-purple-200 text-sm">
            La normativa está disponible públicamente en:
          </p>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-retro-cyan-500 text-jacksons-purple-950 border-4 border-retro-cyan-700 font-bold uppercase tracking-wide text-sm shadow-[2px_2px_0px_0px_#1a1a1a] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1a1a1a] transition-all duration-100"
          >
            🔗 Ver Normativa
          </a>
          <div className="pt-4 border-t-2 border-jacksons-purple-600">
            <p className="text-jacksons-purple-300 text-xs break-all font-mono">
              {currentUrl}
            </p>
          </div>
        </div>
      )}

      {!currentUrl && (
        <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 shadow-[4px_4px_0px_0px_#1a1a1a] text-center">
          <p className="text-jacksons-purple-300">
            No hay normativa cargada. Sube un PDF para que esté disponible.
          </p>
        </div>
      )}
    </div>
  );
}
