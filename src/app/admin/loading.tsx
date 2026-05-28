export default function AdminLoading() {
  return (
    <div className="pixel-root flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block size-8 animate-spin border-4 border-px-gold border-t-transparent" />
        <p className="font-pixel text-[10px] uppercase tracking-wider text-px-ink-dim">
          Cargando...
        </p>
      </div>
    </div>
  );
}
