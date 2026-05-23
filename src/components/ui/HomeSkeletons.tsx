import { Skeleton } from './Skeleton';

export function MetaTierSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="w-45 h-55 shrink-0 rounded-2xl bg-(--nav-hover) border border-(--card-border) p-4 flex flex-col items-center justify-between">
          <Skeleton className="w-full h-24 rounded-xl" />
          <Skeleton className="w-3/4 h-4 rounded" />
          <div className="w-full space-y-2">
            <Skeleton className="w-1/2 h-3 rounded" />
            <Skeleton className="w-full h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProMatchSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-75 h-48 shrink-0 rounded-3xl bg-(--nav-hover) border border-(--card-border) p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <Skeleton className="w-20 h-4 rounded" />
            <Skeleton className="w-12 h-4 rounded" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <Skeleton className="w-12 h-8 rounded" />
            <Skeleton className="w-16 h-16 rounded-2xl" />
          </div>
          <Skeleton className="w-full h-4 rounded" />
        </div>
      ))}
    </div>
  );
}

export function HeroTrendsSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="w-45 h-55 shrink-0 rounded-2xl" />
      ))}
    </div>
  );
}
