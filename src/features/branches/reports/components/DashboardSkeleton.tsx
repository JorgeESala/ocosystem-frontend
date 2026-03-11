export const DashboardSkeleton = () => (
  <div className="min-h-screen animate-pulse bg-gray-900 p-6 text-gray-100">
    {/* Header Skeleton */}
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-gray-800"></div>
        <div className="h-4 w-96 rounded-lg bg-gray-800"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-48 rounded-lg bg-gray-800"></div>
        <div className="h-10 w-64 rounded-lg bg-gray-800"></div>
      </div>
    </div>

    {/* KPIs Skeleton */}
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 rounded-xl border-none bg-gray-800"></div>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-80 rounded-xl bg-gray-800"></div>
      <div className="h-80 rounded-xl bg-gray-800"></div>
    </div>

    {/* Table Skeleton */}
    <div className="h-64 rounded-xl bg-gray-800"></div>
  </div>
);
