import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
    />
  );
}

export function VendorCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image Skeleton */}
      <Skeleton className="h-48 w-full" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        
        {/* Category */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        
        {/* Price */}
        <Skeleton className="h-5 w-1/3 rounded" />
        
        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function VendorGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
      {Array.from({ length: count }).map((_, index) => (
        <VendorCardSkeleton key={index} />
      ))}
    </div>
  );
}

