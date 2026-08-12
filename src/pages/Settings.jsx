import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Check, Database, Globe, Loader2, LogOut, Moon, RotateCcw, Save, SlidersHorizontal, User } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import { useUserStore } from '../store/userStore'
import { useTripStore } from '../store/tripStore'
import { useFavoriteStore } from '../store/favoriteStore'
import { useJournalStore } from '../store/journalStore'
import { useAuthStore } from '../store/authStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTranslation } from '../hooks/useTranslation'
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import { THEMES, useThemeStore, applyTheme } from '../store/themeStore'
import { cn } from '../utils/cn'

const inputCls =
  'w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:bg-sand-100'

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-card sm:p-8 dark:bg-sand-100">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-500">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">{title}</h2>
          {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-3 text-left"
    >
      <span className="text-sm font-medium text-ink-700">{label}</span>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition',
          checked ? 'bg-brand-500' : 'bg-stone-300'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all',
            checked ? 'left-[22px]' : 'left-0.5'
          )}
        />
      </span>
    </button>
  )
}

export default function Settings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const updateProfile = useUserStore((s) => s.updateProfile)
  const resetProfile = useUserStore((s) => s.resetProfile)
  const resetTrips = useTripStore((s) => s.resetTrips)
  const clearFavorites = useFavoriteStore((s) => s.clearFavorites)
  const authUser = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [prefs, setPrefs] = useLocalStorage('travelmap-preferences', {
    reduceMotion: false,
    emailUpdates: true,
    showOnMap: true,
  })

  const [form, setForm] = useState({
    name: profile.name,
    username: profile.username,
    bio: profile.bio,
    location: profile.location,
    avatar: profile.avatar,
    cover: profile.cover,
  })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const saveProfile = (e) => {
    e.preventDefault()
    setBusy(true)
    setTimeout(() => {
      updateProfile(form)
      setBusy(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 400)
  }

  const clearAllData = () => {
    if (window.confirm(t('settings.clearConfirm'))) {
      resetTrips()
      clearFavorites()
      localStorage.removeItem('travelmap-journal')
      localStorage.removeItem('travelmap-user')
      localStorage.removeItem('travelmap-preferences')
      window.location.reload()
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
            {t('settings.title')}
          </h1>
          <p className="mt-2 text-ink-500">{t('settings.subtitle')}</p>
        </header>

        {/* Account */}
        <Section icon={User} title={t('settings.account')} subtitle={t('settings.accountSub')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-brand-50 text-brand-500">
                {authUser?.avatar ? (
                  <img src={authUser.avatar} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{authUser?.name || t('settings.signedIn')}</p>
                <p className="text-xs text-ink-400">{authUser?.email || 'TravelMap account'}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await signOut()
                navigate('/')
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sand-200 px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-brand-200 hover:text-brand-600"
            >
              <LogOut className="h-4 w-4" /> {t('common.signOut')}
            </button>
          </div>
          <p className="mt-4 border-t border-sand-100 pt-4 text-xs leading-relaxed text-ink-400">
            {t('settings.accountHint')}
          </p>
        </Section>

        {/* Profile form */}
        <Section icon={User} title={t('settings.profile')} subtitle={t('settings.profileSub')}>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">{t('settings.name')}</span>
                <input name="profile-name" id="profile-name" value={form.name} onChange={set('name')} className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">{t('settings.username')}</span>
                <input name="profile-username" id="profile-username" value={form.username} onChange={set('username')} className={inputCls} />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">{t('settings.location')}</span>
              <input name="profile-location" id="profile-location" value={form.location} onChange={set('location')} className={inputCls} placeholder="City, Country" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">{t('settings.bio')}</span>
              <textarea
                name="profile-bio"
                id="profile-bio"
                value={form.bio}
                onChange={set('bio')}
                rows={3}
                className={cn(inputCls, 'resize-none')}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">{t('settings.avatarUrl')}</span>
                <input name="profile-avatar" id="profile-avatar" value={form.avatar} onChange={set('avatar')} className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">{t('settings.coverUrl')}</span>
                <input name="profile-cover" id="profile-cover" value={form.cover} onChange={set('cover')} className={inputCls} />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-95 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('settings.saveChanges')}
              </button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-1 text-sm font-medium text-sage-600"
                >
                  <Check className="h-4 w-4" /> {t('settings.saved')}
                </motion.span>
              )}
              <button
                type="button"
                onClick={resetProfile}
                className="text-sm font-medium text-ink-400 transition hover:text-ink-700"
              >
                {t('settings.resetProfile')}
              </button>
            </div>
          </form>
        </Section>

        {/* Preferences */}
        <Section icon={SlidersHorizontal} title={t('settings.preferences')} subtitle={t('settings.prefsSub')}>
          <div className="divide-y divide-sand-100">
            <Toggle
              checked={prefs.reduceMotion}
              onChange={(v) => setPrefs({ ...prefs, reduceMotion: v })}
              label={t('settings.reduceMotion')}
            />
            <Toggle
              checked={prefs.emailUpdates}
              onChange={(v) => setPrefs({ ...prefs, emailUpdates: v })}
              label={t('settings.digest')}
            />
            <Toggle
              checked={prefs.showOnMap}
              onChange={(v) => setPrefs({ ...prefs, showOnMap: v })}
              label={t('settings.showOnMap')}
            />
          </div>
        </Section>

        {/* Theme */}
        <Section icon={Moon} title={t('theme.label')} subtitle={t('settings.prefsSub')}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-medium text-ink-700">{t('theme.label')}</p>
            <div className="inline-flex items-center gap-1 rounded-full bg-sand-100 p-1">
              {THEMES.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTheme(id)
                    applyTheme(id) // apply immediately, no re-render wait
                  }}
                  aria-pressed={theme === id}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                    theme === id
                      ? 'bg-white text-ink-900 shadow-soft dark:bg-sand-50'
                      : 'text-ink-500 hover:text-ink-700'
                  )}
                >
                  {t(`theme.${id}`)}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Language */}
        <Section icon={Globe} title={t('language.label')} subtitle={t('settings.prefsSub')}>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-ink-700">{t('language.label')}</p>
            <LanguageSwitcher />
          </div>
        </Section>

        {/* Data */}
        <Section icon={Database} title={t('settings.data')} subtitle={t('settings.dataSub')}>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-sand-200 py-3 text-sm font-semibold text-ink-700 transition hover:border-brand-200 hover:text-brand-600"
            >
              <RotateCcw className="h-4 w-4" /> {t('settings.viewMap')}
            </button>
            <button
              onClick={clearAllData}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-100 bg-brand-50 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              <AlertTriangle className="h-4 w-4" /> {t('settings.clearData')}
            </button>
            <p className="text-center text-xs text-ink-400">
              {t('settings.dataFooter')}
            </p>
          </div>
        </Section>
      </div>
    </PageTransition>
  )
}
