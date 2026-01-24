export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-jacksons-purple-700 rounded" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 h-24"
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="bg-jacksons-purple-800 border-4 border-jacksons-purple-600 p-6 h-48" />
    </div>
  );
}
