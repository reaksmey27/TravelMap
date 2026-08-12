import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Heart, LogOut, MapPin, Moon, Settings, Sun, User } from 'lucide-react'
import SearchBar from '../common/SearchBar'
import { NAV_LINKS } from '../../utils/constants'
import { useFavoriteStore } from '../../store/favoriteStore'
import { useUserStore } from '../../store/userStore'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore, useIsDark, applyTheme } from '../../store/themeStore'
import { useTranslation } from '../../hooks/useTranslation'
import { useImageFallback } from '../../hooks/useImageFallback'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { cn } from '../../utils/cn'
import ConfirmDialog from '../common/ConfirmDialog'

export default function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const favCount = useFavoriteStore((s) => s.photos.length + s.destinations.length + s.trips.length)
  const profile = useUserStore((s) => s.profile)
  const authStatus = useAuthStore((s) => s.status)
  const authUser = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const signedIn = authStatus === 'signedIn'
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const isDark = useIsDark()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch {
    }
  }

  const avatar = profile.avatar || authUser?.avatar
  const name = profile.name || authUser?.name
  const [avatarFailed, setAvatarFailed] = useImageFallback(avatar)
  const menuItems = [
    { to: '/profile', icon: User, label: t('navbar.myProfile') },
    { to: '/settings', icon: Settings, label: t('navbar.settings') },
  ]

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[1000] transition-all duration-300',
        scrolled
          ? 'bg-white/85 shadow-soft backdrop-blur-xl dark:backdrop-blur-0 dark:border-b dark:border-sand-300 dark:bg-sand-100'
          : 'bg-white/60 backdrop-blur-md dark:backdrop-blur-0 dark:border-b dark:border-sand-300 dark:bg-sand-100'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={t('navbar.home')}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white shadow-soft">
            <MapPin className="h-5 w-5" />
          </span>
          <span className="hidden font-display text-lg font-extrabold tracking-tight text-ink-900 sm:block">
            Travel<span className="text-brand-600">Map</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = location.pathname.startsWith(link.to)
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition',
                  active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-sand-100 dark:bg-sand-200"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{t(link.labelKey)}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs lg:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={() => {
              const next = isDark ? 'light' : 'dark'
              setTheme(next)
              applyTheme(next)
            }}
            aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
            title={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
            className="grid h-10 w-10 place-items-center rounded-full text-ink-600 transition hover:bg-sand-100 hover:text-brand-600 dark:hover:bg-sand-200 dark:hover:text-brand-400"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <LanguageSwitcher compact className="hidden sm:inline-flex" />
          <Link
            to="/favorites"
            aria-label={`${t('nav.favorites')} (${favCount})`}
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink-600 transition hover:bg-sand-100 hover:text-brand-600 dark:hover:bg-sand-200 dark:hover:text-brand-400"
          >
            <Heart className="h-5 w-5" />
            <AnimatePresence>
              {favCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white"
                >
                  {favCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {signedIn ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={t('navbar.accountMenu')}
                aria-expanded={menuOpen}
                className="flex items-center gap-1.5 rounded-full border-2 border-white shadow-soft transition hover:opacity-85 dark:border-sand-200"
              >
                <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full">
                  {avatar && !avatarFailed ? (
                    <img
                      src={avatar}
                      alt={name || 'Account'}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarFailed(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-brand-500 text-xs font-bold text-white">
                      {(name || 'T')[0].toUpperCase()}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn('mr-1 hidden h-4 w-4 text-ink-400 transition-transform sm:block', menuOpen && 'rotate-180')}
                />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                    aria-label="Account menu"
                    className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-sand-100 bg-white py-1.5 shadow-lift dark:border-sand-300 dark:bg-sand-200"
                  >
                    <div className="border-b border-sand-100 px-4 pb-2.5 pt-2 dark:border-sand-300">
                      <p className="truncate text-sm font-semibold text-ink-900">{name || t('app.traveler')}</p>
                      {authUser?.email && (
                        <p className="truncate text-xs text-ink-400">{authUser.email}</p>
                      )}
                    </div>
                    {menuItems.map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-sand-50 hover:text-brand-600 dark:hover:bg-sand-300 dark:hover:text-brand-400"
                      >
                        <Icon className="h-4 w-4 text-ink-400" />
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-sand-100 p-2 dark:border-sand-300">
                      <LanguageSwitcher compact className="w-full justify-center" />
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setConfirmOpen(true)
                      }}
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-100"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('common.signOut')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            authStatus !== 'loading' && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ink-800 active:scale-95 dark:bg-ink-950 dark:hover:bg-white/10"
              >
                <User className="h-4 w-4" />
                {t('common.signIn')}
              </Link>
            )
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={t('common.confirmSignOutTitle')}
        message={t('common.confirmSignOut')}
        confirmLabel={t('common.signOut')}
        icon={LogOut}
        onConfirm={() => {
          setConfirmOpen(false)
          handleSignOut()
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </header>
  )
}
