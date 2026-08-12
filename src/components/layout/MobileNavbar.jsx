import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Backpack, Compass, Home, MapPin, User } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../utils/cn'

const items = [
  { to: '/', labelKey: 'nav.home', icon: Home, end: true },
  { to: '/explore', labelKey: 'nav.explore', icon: Compass },
  { to: '/map', labelKey: 'nav.map', icon: MapPin },
  { to: '/trips', labelKey: 'nav.trips', icon: Backpack },
  { to: '/profile', labelKey: 'nav.profile', icon: User },
]

export default function MobileNavbar() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-sand-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden dark:bg-sand-100/90"
    >
      <div className="grid grid-cols-5">
        {items.map(({ to, labelKey, icon: Icon, end }) => {
          const label = t(labelKey)
          const active = end ? pathname === to : pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className="relative flex flex-col items-center gap-1 py-2.5"
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-dot"
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-brand-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  'h-5 w-5 transition',
                  active ? 'text-brand-600' : 'text-ink-400'
                )}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  active ? 'text-brand-700' : 'text-ink-400'
                )}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
