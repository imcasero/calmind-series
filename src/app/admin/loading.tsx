export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-retro-gold-500 border-t-transparent animate-spin mb-4" />
        <p className="text-jacksons-purple-300 text-sm uppercase tracking-wide">
          Cargando...
        </p>
      </div>
    </div>
  );
}
