import { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import MainLayout from '../layouts/MainLayout'
import RequireAuth from '../components/auth/RequireAuth'

const Home = lazy(() => import('../pages/Home'))
const Explore = lazy(() => import('../pages/Explore'))
const MapPage = lazy(() => import('../pages/MapPage'))
const DestinationDetails = lazy(() => import('../pages/DestinationDetails'))
const Login = lazy(() => import('../pages/Login'))
const Trips = lazy(() => import('../pages/Trips'))
const CreateTrip = lazy(() => import('../pages/CreateTrip'))
const TripDetails = lazy(() => import('../pages/TripDetails'))
const PhotoDetails = lazy(() => import('../pages/PhotoDetails'))
const Journal = lazy(() => import('../pages/Journal'))
const JournalDetails = lazy(() => import('../pages/JournalDetails'))
const Favorites = lazy(() => import('../pages/Favorites'))
const Profile = lazy(() => import('../pages/Profile'))
const Settings = lazy(() => import('../pages/Settings'))
const NotFound = lazy(() => import('../pages/NotFound'))

/** Wrap personal pages — they require a signed-in account. */
const Protected = ({ children }) => <RequireAuth>{children}</RequireAuth>

function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading page">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex flex-col items-center gap-3"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft">
          <MapPin className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-ink-400">Traveling to your destination…</p>
      </motion.div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/destinations/:id" element={<DestinationDetails />} />
          <Route path="/photos/:id" element={<PhotoDetails />} />
          <Route path="/login" element={<Login />} />

          {/* Personal pages — sign-in required */}
          <Route path="/map" element={<Protected><MapPage /></Protected>} />
          <Route path="/trips" element={<Protected><Trips /></Protected>} />
          <Route path="/trips/create" element={<Protected><CreateTrip /></Protected>} />
          <Route path="/trips/:id" element={<Protected><TripDetails /></Protected>} />
          <Route path="/journal" element={<Protected><Journal /></Protected>} />
          <Route path="/journal/:id" element={<Protected><JournalDetails /></Protected>} />
          <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatedRoutes />
    </Suspense>
  )
}
