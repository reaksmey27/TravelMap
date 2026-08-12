import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Camera, Map as MapIcon, MapPin } from 'lucide-react'
import MapView from '../map/MapView'
import photoApi from '../../services/photoApi'
import { useTranslation } from '../../hooks/useTranslation'

const DEFAULT_CENTER = [20, 0]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function HeroSection() {
  const { t } = useTranslation()
  const [hero, setHero] = useState(null) // { image, thumb, title, user }
  const [stack, setStack] = useState([])

  useEffect(() => {
    let cancelled = false
    photoApi
      .getTrending({ perPage: 4 })
      .then((data) => {
        if (cancelled || data.photos.length === 0) return
        setHero(data.photos[0])
        setStack(data.photos.slice(1, 4))
      })
      .catch(() => {
        // No live photos available — the gradient still looks good.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-card" aria-label={t('hero.welcomeAria')}>
      {/* Background */}
      <div className="absolute inset-0">
        {hero?.url ? (
          <img src={hero.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ink-900 via-ink-800 to-sage-900 dark:from-ink-950 dark:via-ink-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 via-ink-900/60 to-ink-900/20 dark:from-ink-950/90 dark:via-ink-950/60 dark:to-ink-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent dark:from-ink-950/60" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="max-w-xl">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200 backdrop-blur"
          >
            <MapPin className="h-3.5 w-3.5" />
            {t('app.tagline')}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {t('hero.exploreWorld')}
            <br />
            <span className="text-brand-300">{t('hero.captureMoments')}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mt-5 max-w-md text-balance text-base leading-relaxed text-white/80 sm:text-lg"
          >
            {t('hero.sub')}
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/map"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-600 active:scale-95"
            >
              <MapIcon className="h-4 w-4" />
              {t('hero.exploreMap')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/trips/create"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              <Camera className="h-4 w-4" />
              {t('hero.createTrip')}
            </Link>
          </motion.div>
        </div>

        {/* Floating cards */}
        {hero && (
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] items-center justify-center xl:flex">
            {/* Live featured photo card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="absolute right-[16%] top-[10%] w-64 animate-float"
            >
              <div className="overflow-hidden rounded-2xl bg-white shadow-lift dark:bg-sand-100">
                <img src={hero.thumb || hero.url} alt={hero.title} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="flex items-center gap-1 text-xs font-semibold text-brand-600">
                    <MapPin className="h-3.5 w-3.5" /> {hero.user?.name || t('hero.featuredPhoto')}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-500">{hero.title}</p>
                </div>
              </div>
            </motion.div>

            {/* Mini map preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute bottom-[8%] right-[30%] w-64 animate-float-slow"
            >
              <div className="overflow-hidden rounded-2xl bg-white p-2 shadow-lift dark:bg-sand-100">
                <div className="relative h-36 overflow-hidden rounded-xl">
                  <MapView
                    center={DEFAULT_CENTER}
                    zoom={2}
                    controls="none"
                    forceLayerSwitcher
                    layerSwitcherClassName="left-2 top-2 scale-90"
                    cluster={false}
                    markers={[]}
                  />
                </div>
                <div className="flex items-center justify-between px-2 py-2.5">
                  <p className="text-xs font-bold text-ink-900">{t('hero.whereNext')}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-sage-600">
                    OpenStreetMap
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Live photo stack */}
            {stack.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.65 }}
                className="absolute right-[4%] bottom-[22%] flex -space-x-5"
              >
                {stack.map((p, i) => (
                  <motion.img
                    key={p.id}
                    src={p.thumb}
                    alt=""
                    whileHover={{ y: -8, rotate: i % 2 === 0 ? -4 : 4, scale: 1.05 }}
                    className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lift"
                    style={{ zIndex: 10 - i, transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)` }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
