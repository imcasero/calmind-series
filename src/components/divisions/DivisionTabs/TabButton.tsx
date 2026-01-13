interface TabButtonProps {
  id: string;
  label: string;
  emoji: string;
  isActive: boolean;
  showBorder: boolean;
  onClick: () => void;
}

export default function TabButton({
  label,
  emoji,
  isActive,
  showBorder,
  onClick,
}: TabButtonProps) {
  const bgClass = isActive ? 'bg-yellow-400' : 'bg-jacksons-purple-600';
  const textClass = isActive
    ? 'text-slate-900 drop-shadow-md font-black'
    : 'text-white drop-shadow font-bold';
  const borderClass = showBorder ? 'border-r-4 border-jacksons-purple-800' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm uppercase tracking-wide transition-all duration-200 hover:opacity-80 ${bgClass} ${textClass} ${borderClass}`}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span>{label}</span>
      </div>
    </button>
  );
}
