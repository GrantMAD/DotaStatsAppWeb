import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-500">
      {/* Hero Header Skeleton */}
      <div className="space-y-6 pt-12">
        <Skeleton className="h-20 w-3/4 rounded-3xl" />
        <Skeleton className="h-6 w-1/2 rounded-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-16 w-48 rounded-2xl" />
          <Skeleton className="h-16 flex-1 rounded-2xl" />
        </div>
      </div>

      {/* Content Skeletons */}
      <div className="space-y-8">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-55 w-45 shrink-0 rounded-2xl" />
          ))}
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-75 shrink-0 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
