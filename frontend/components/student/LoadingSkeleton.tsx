'use client';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-64" />

      {/* Student Info Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-32" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Schedule Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>

      {/* Announcements Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

