'use client';

import { startTransition, useEffect, useState } from 'react';
import {
  AdminButton,
  AdminCard,
  AdminErrorBanner,
} from '@/components/admin/ui';
import { createClient } from '@/lib/supabase/client';
import { RegulationsUploadSchema } from '@/lib/types/schemas';
import {
  createRegulationsUploadAction,
  finalizeRegulationsUploadAction,
} from '../_actions';

const STORAGE_BUCKET = 'normativas';

interface RegulationsManagerProps {
  currentPdfUrl: string | null;
}

export default function RegulationsManager({
  currentPdfUrl,
}: RegulationsManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(currentPdfUrl);

  useEffect(() => {
    setCurrentUrl(currentPdfUrl);
  }, [currentPdfUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const parsed = RegulationsUploadSchema.safeParse(selectedFile);
      if (!parsed.success) {
        setError(parsed.error.issues.map((i) => i.message).join(' · '));
        setFile(null);
        return;
      }
      setFile(parsed.data);
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

    const signed = await createRegulationsUploadAction();
    if (!signed.ok) {
      setError(signed.error);
      setUploading(false);
      return;
    }

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .uploadToSignedUrl(signed.path, signed.token, file, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    startTransition(async () => {
      const result = await finalizeRegulationsUploadAction();
      if (!result.ok) {
        setError(result.error);
      } else {
        setCurrentUrl(`${result.url}?v=${Date.now()}`);
        setFile(null);
        setSuccess(true);
        const fileInput = document.getElementById(
          'pdf-upload',
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
      setUploading(false);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h1 className="font-pixel text-lg uppercase tracking-wider text-px-gold">
        Normativa Pokémon
      </h1>

      {error && (
        <AdminErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      {success && (
        <div className="flex items-start justify-between gap-4 border-[3px] border-px-success bg-px-deep p-4">
          <p className="font-retro text-base text-px-success">
            ✓ Normativa actualizada exitosamente
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="shrink-0 font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim transition-colors hover:text-px-ink"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Upload */}
      <form onSubmit={handleUpload}>
        <AdminCard className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="pdf-upload"
              className="mb-2 block font-pixel text-[9px] uppercase tracking-wider text-px-ink-dim"
            >
              Selecciona un archivo PDF
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full border-[3px] border-px-border bg-px-deep font-retro text-base text-px-ink-soft file:mr-4 file:cursor-pointer file:border-0 file:border-r-[3px] file:border-px-border file:bg-px-gold file:px-5 file:py-3 file:font-pixel file:text-[10px] file:uppercase file:tracking-wider file:text-px-deep"
            />
            {file && (
              <div className="mt-3 border-2 border-px-border bg-px-base p-3 font-retro text-base text-px-ink-soft">
                <strong className="text-px-ink">Archivo:</strong> {file.name}
                <br />
                <strong className="text-px-ink">Tamaño:</strong>{' '}
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>

          <AdminButton
            type="submit"
            tone="primary"
            disabled={!file || uploading}
            className="w-full justify-center"
          >
            {uploading ? 'Subiendo...' : '📤 Subir Normativa'}
          </AdminButton>
        </AdminCard>
      </form>

      {/* Current PDF */}
      {currentUrl ? (
        <AdminCard className="flex flex-col gap-4">
          <h2 className="font-pixel text-sm uppercase tracking-wider text-px-gold">
            📄 Normativa Actual
          </h2>
          <p className="font-retro text-base text-px-ink-soft">
            La normativa está disponible públicamente en:
          </p>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn pixel-btn--cyan pixel-btn--sm self-start"
          >
            🔗 Ver Normativa
          </a>
          <p className="break-all border-t-2 border-px-border pt-4 font-num text-xs text-px-ink-dim">
            {currentUrl}
          </p>
        </AdminCard>
      ) : (
        <AdminCard>
          <p className="text-center font-retro text-lg text-px-ink-dim">
            No hay normativa cargada. Sube un PDF para que esté disponible.
          </p>
        </AdminCard>
      )}
    </div>
  );
}
