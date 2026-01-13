export default function EmptyState() {
  return (
    <div className="bg-jacksons-purple-800/80 rounded-lg border-4 border-yellow-400 p-8 text-center shadow-2xl">
      <div className="text-6xl mb-4">👥</div>
      <h3 className="text-2xl drop-shadow-md font-black tracking-wide text-yellow-300 mb-4">
        Sin Participantes
      </h3>
      <p className="text-white/95 drop-shadow font-semibold">
        Aún no hay participantes registrados en esta división.
      </p>
    </div>
  );
}
