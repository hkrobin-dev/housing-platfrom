export default function DashboardLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-8 w-48 rounded-lg bg-gray-200 animate-pulse" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse mb-2" />
            <div className="h-8 w-16 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
