import { Camera, Globe2, MapPin, MapPinned, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import { useImageFallback } from '../../hooks/useImageFallback'
import { formatDate } from '../../utils/format'
import StatCard from '../common/StatCard'

const STAT_ICONS = {
  trips: MapPinned,
  photos: Camera,
  places: MapPin,
  countries: Globe2,
}

export default function ProfileHeader({ profile, stats = [] }) {
  const { t, lang } = useTranslation()
  const [avatarFailed, setAvatarFailed] = useImageFallback(profile.avatar)
  const [coverFailed, setCoverFailed] = useImageFallback(profile.cover)
  const name = profile.name || t('profile.yourName')
  const username = profile.username ? `@${profile.username}` : '@you'
  const initials = (profile.name || 'Y')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const memberSince = profile.joinedAt ? formatDate(profile.joinedAt, lang) : ''

  return (
    <div className="group/header overflow-hidden rounded-3xl bg-white shadow-card dark:bg-sand-100">
      <div className="relative h-44 overflow-hidden sm:h-56">
        {profile.cover && !coverFailed ? (
          <img
            src={profile.cover}
            alt={`${name}'s cover`}
            onError={() => setCoverFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/header:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-600 via-sage-600 to-ink-800 dark:from-brand-700 dark:via-sage-700 dark:to-ink-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/55 via-ink-900/10 to-transparent" />
        <Link
          to="/settings"
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/30 hover:shadow-soft active:scale-95"
        >
          <Settings className="h-4 w-4" /> {t('profile.editProfile')}
        </Link>
      </div>

      <div className="px-5 pb-6 sm:px-8">
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {profile.avatar && !avatarFailed ? (
              <img
                src={profile.avatar}
                alt={name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white object-cover shadow-card transition-transform duration-300 group-hover/header:scale-[1.03] dark:border-sand-100"
              />
            ) : (
              <span className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border-4 border-white bg-brand-500 shadow-card transition-transform duration-300 group-hover/header:scale-[1.03] dark:border-sand-100">
                <span className="font-display text-3xl font-extrabold text-white">{initials}</span>
              </span>
            )}
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
                {name}
              </h1>
              <p className="text-sm text-ink-500">{username}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
                <MapPin className="h-4 w-4 text-brand-500" />
                {profile.location}
              </span>
            )}
            {memberSince && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
                <Globe2 className="h-4 w-4 text-sage-600" />
                {t('profile.memberSince', { year: memberSince })}
              </span>
            )}
          </div>
        </div>

        {profile.bio && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-600">{profile.bio}</p>}

        {!profile.name && !profile.bio && (
          <p className="mt-4 max-w-2xl text-sm text-ink-400">
            {t('profile.setupHint')}
          </p>
        )}

        {stats.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <StatCard
                key={s.label}
                value={s.value}
                label={s.label}
                icon={s.icon || STAT_ICONS[s.id]}
                accent={s.accent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
