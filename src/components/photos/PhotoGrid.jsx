import { ImageOff } from 'lucide-react'
import PhotoCard from './PhotoCard'
import { PhotoGridSkeleton } from '../common/LoadingSkeleton'
import { useTranslation } from '../../hooks/useTranslation'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'

const ASPECTS = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[4/5]']

export default function PhotoGrid({
  photos,
  loading,
  error,
  onRetry,
  onPhotoClick,
  skeletonCount = 8,
  emptyTitle,
  emptyMessage,
}) {
  const { t } = useTranslation()
  if (loading && photos.length === 0) return <PhotoGridSkeleton count={skeletonCount} />

  if (error && photos.length === 0) {
    return <ErrorState title={t('photoGrid.loadError')} onRetry={onRetry} />
  }

  if (photos.length === 0) {
    return (
      <EmptyState
        icon={ImageOff}
        title={emptyTitle || t('photoGrid.noPhotos')}
        message={emptyMessage || t('photoGrid.noPhotosMsg')}
        action={
          onRetry && (
            <button
              onClick={onRetry}
              className="rounded-full border border-sand-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-brand-200 hover:text-brand-600 dark:bg-sand-100"
            >
              {t('common.tryAgain')}
            </button>
          )
        }
      />
    )
  }

  return (
    <div className="masonry" aria-label="Photo grid">
      {photos.map((photo, i) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={i}
          aspect={ASPECTS[i % ASPECTS.length]}
          onClick={onPhotoClick}
        />
      ))}
    </div>
  )
}
