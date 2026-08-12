import { cn } from '../../utils/cn'

function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden="true" />
}

export function PhotoGridSkeleton({ count = 8 }) {
  const aspects = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[4/5]']
  return (
    <div className="masonry" aria-label="Loading photos">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-soft dark:bg-sand-100">
          <Skeleton className={cn('w-full rounded-none', aspects[i % aspects.length])} />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ className }) {
  return (
    <div className={cn('rounded-2xl bg-white p-5 shadow-soft dark:bg-sand-100', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  )
}

export function WeatherSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft dark:bg-sand-100">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Skeleton className="h-12 w-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}

export default Skeleton
