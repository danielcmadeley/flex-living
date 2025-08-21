import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/Header";

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
    <div className="flex flex-col min-h-screen">
      {/* Use actual Header component for consistency */}
      <Header />

      {/* Main Layout - Split view with properties and map */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left side - Properties list (60% width) */}
        <div className="w-[60%] overflow-y-auto">
          <div className="p-8">
            {/* Search Header */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4 justify-between text-sm mb-6">
                <div className="flex-1 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="flex-1 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="flex-1 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="flex-1 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>

              {/* Title and count */}
              <div className="flex justify-between items-center mb-4">
                <div className="h-8 bg-gray-100 rounded w-64 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-32 animate-pulse"></div>
              </div>

              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <div className="h-8 bg-gray-100 rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded w-28 animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded w-16 animate-pulse"></div>
              </div>
            </div>

            {/* Property Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Property Image */}
                  <div className="relative overflow-hidden">
                    <div className="h-48 bg-gray-100 animate-pulse"></div>
                    <div className="absolute top-4 right-4">
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="h-6 bg-gray-100 rounded w-3/4 mb-3 animate-pulse"></div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="h-4 bg-gray-100 rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded w-4/5 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                      <div className="h-4 bg-gray-100 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 bg-gray-100 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Map (40% width) */}
        <div className="w-[40%] h-full relative">
          <div className="absolute inset-0 rounded-l-2xl overflow-hidden shadow-lg">
            <div className="h-full bg-gray-100 animate-pulse relative">
              {/* Map loading placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>

              {/* Map controls skeleton */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Map legend/info skeleton */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white rounded-lg p-3 shadow-lg">
                  <div className="h-4 bg-gray-100 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-gray-100 rounded-full animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-gray-100 rounded-full animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IndividualListingLoadingState() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Use actual Header component for consistency */}
      <Header />

      <div className="max-w-7xl mx-auto w-full px-6 flex-1">
        <div className="flex flex-col space-y-8 pb-12">
          {/* Image Gallery Skeleton */}
          <div className="flex flex-col">
            <div className="mb-4">
              <div className="h-64 md:h-96 lg:h-[500px] bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 animate-pulse rounded-md"
                ></div>
              ))}
            </div>
          </div>

          {/* Property Header Skeleton */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="h-10 bg-gray-100 animate-pulse rounded-md mb-2 w-3/4"></div>
                <div className="h-6 bg-gray-100 animate-pulse rounded-md mb-3 w-full"></div>
                <div className="flex items-center gap-6 mb-4">
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-24"></div>
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-32"></div>
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-20"></div>
                </div>
              </div>
              <div className="flex gap-2 ml-6">
                <div className="h-10 bg-gray-100 animate-pulse rounded-md w-32"></div>
                <div className="h-10 bg-gray-100 animate-pulse rounded-md w-24"></div>
              </div>
            </div>

            {/* Statistics Skeleton */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="h-6 bg-gray-100 animate-pulse rounded w-48 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded shadow">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-100 animate-pulse rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Sections Skeleton */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
              {/* About Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="h-6 bg-gray-100 animate-pulse rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6"></div>
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-4/5"></div>
                </div>
              </div>

              {/* Amenities Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="h-6 bg-gray-100 animate-pulse rounded w-32 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-gray-100 animate-pulse rounded w-4/5"
                      ></div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-4 bg-gray-100 animate-pulse rounded w-4/5"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="h-6 bg-gray-100 animate-pulse rounded w-24 mb-4"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-96 bg-gray-100 animate-pulse rounded-lg"></div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-32 mb-2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-100 animate-pulse rounded w-24"></div>
                        <div className="h-3 bg-gray-100 animate-pulse rounded w-28"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="h-6 bg-gray-100 animate-pulse rounded w-48 mb-6"></div>
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 animate-pulse rounded-full"></div>
                          <div className="h-4 bg-gray-100 animate-pulse rounded w-24"></div>
                        </div>
                        <div className="h-4 bg-gray-100 animate-pulse rounded w-16"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 animate-pulse rounded w-full"></div>
                        <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6"></div>
                        <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Widget Skeleton */}
            <div className="lg:w-96 lg:shrink-0">
              <div className="sticky top-6 bg-white border rounded-lg p-6 shadow-lg">
                <div className="bg-gray-100 animate-pulse rounded-lg mb-6 h-20"></div>
                <div className="space-y-4">
                  <div className="h-16 bg-gray-50 animate-pulse rounded-lg"></div>
                  <div className="h-16 bg-gray-50 animate-pulse rounded-lg"></div>
                  <div className="h-20 bg-gray-50 animate-pulse rounded-lg"></div>
                  <div className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
                  <div className="h-10 bg-gray-50 animate-pulse rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
