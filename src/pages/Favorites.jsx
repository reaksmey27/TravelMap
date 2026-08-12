import { useState } from 'react'
import { Heart } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import FilterTabs from '../components/common/FilterTabs'
import PhotoGrid from '../components/photos/PhotoGrid'
import PhotoModal from '../components/common/PhotoModal'
import DestinationCard from '../components/destinations/DestinationCard'
import TripCard from '../components/trips/TripCard'
import EmptyState from '../components/common/EmptyState'
import { useFavoriteStore } from '../store/favoriteStore'
import { useTranslation } from '../hooks/useTranslation'
import { Link } from 'react-router-dom'

const TABS = ['favorites.tabPhotos', 'favorites.tabDestinations', 'favorites.tabTrips']

export default function Favorites() {
  const { t } = useTranslation()
  const [tab, setTab] = useState(TABS[0])
  const [modalIndex, setModalIndex] = useState(null)
  const favPhotos = useFavoriteStore((s) => s.photos)
  const favDestinations = useFavoriteStore((s) => s.destinations)
  const favTrips = useFavoriteStore((s) => s.trips)

  return (
    <PageTransition>
      <div className="space-y-8">
        <header>
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
            <Heart className="h-4 w-4" /> {t('favorites.eyebrow')}
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {t('favorites.title')}
          </h1>
          <p className="mt-2 text-ink-500">{t('favorites.sub')}</p>
        </header>

        <FilterTabs options={TABS} value={tab} onChange={setTab} />

        {tab === 'favorites.tabPhotos' &&
          (favPhotos.length > 0 ? (
            <>
              <PhotoGrid
                photos={favPhotos}
                loading={false}
                onPhotoClick={(photo) => setModalIndex(favPhotos.findIndex((p) => p.id === photo.id))}
                emptyTitle={t('favorites.noSavedPhotos')}
              />
              {modalIndex != null && favPhotos[modalIndex] && (
                <PhotoModal
                  photos={favPhotos}
                  index={modalIndex}
                  onClose={() => setModalIndex(null)}
                  onNavigate={setModalIndex}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={Heart}
              title={t('favorites.noPhotos')}
              message={t('favorites.noPhotosMsg')}
              action={
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  {t('favorites.explorePhotos')}
                </Link>
              }
            />
          ))}

        {tab === 'favorites.tabDestinations' &&
          (favDestinations.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favDestinations.map((dest, i) => (
                <DestinationCard key={dest.id} destination={dest} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title={t('favorites.noDest')}
              message={t('favorites.noDestMsg')}
              action={
                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  {t('favorites.browseMap')}
                </Link>
              }
            />
          ))}

        {tab === 'favorites.tabTrips' &&
          (favTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {favTrips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title={t('favorites.noTrips')}
              message={t('favorites.noTripsMsg')}
            />
          ))}
      </div>
    </PageTransition>
  )
}
