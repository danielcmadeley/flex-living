import { Skeleton } from '@/components/ui/skeleton';

export function ListingCardLoadingSkeleton() {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <div className="flex items-center mt-2 gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="mb-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function ListingsLoadingState({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardLoadingSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatsLoadingState() {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded shadow">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroLoadingState() {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-5 w-80 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export function ListingsPageLoadingState() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <HeroLoadingState />

      <div className="mb-6 flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-6 w-40" />
      </div>

      <StatsLoadingState />

      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>

        <ListingsLoadingState />
      </div>
    </div>
  );
}

export function HomePageLoadingState() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <Skeleton className="h-10 w-80 mb-4" />
        <Skeleton className="h-6 w-96 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="mb-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <ListingsLoadingState count={3} />
      </div>

      <div className="text-center mt-8">
        <Skeleton className="h-10 w-40 mx-auto" />
      </div>
    </div>
  );
}
