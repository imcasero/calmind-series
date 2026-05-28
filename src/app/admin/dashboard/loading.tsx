export default function DashboardLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-px-elev" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['a', 'b', 'c', 'd'].map((k) => (
          <div
            key={k}
            className="h-24 border-[3px] border-px-border bg-px-elev"
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-48 border-[3px] border-px-border bg-px-elev" />
    </div>
  );
}
