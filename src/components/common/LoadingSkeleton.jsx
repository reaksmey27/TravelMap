import { cn } from '../../utils/cn'

function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden="true" />
}

/** Photo-card shaped skeleton */
export function PhotoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft dark:bg-sand-100">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/** Destination-card shaped skeleton */
export function DestinationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft dark:bg-sand-100">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

/** Trip-card shaped skeleton */
export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft dark:bg-sand-100">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/** Photo-grid skeleton (masonry column with varied heights) */
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

/** Generic card skeleton */
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

/** Weather card skeleton */
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

/** Profile header skeleton */
export function ProfileSkeleton() {
  return (
    <div className="rounded-3xl bg-white shadow-soft dark:bg-sand-100">
      <Skeleton className="h-44 w-full rounded-t-3xl sm:h-56" />
      <div className="px-6 pb-6">
        <div className="-mt-10 mb-4">
          <Skeleton className="h-20 w-20 rounded-full border-4 border-white" />
        </div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skeleton
