import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, BookOpen, ExternalLink, Heart, Loader2, Lock, Mail, MapPin, Send } from 'lucide-react'
import PageTransition from '../components/common/PageTransition'
import LanguageSwitcher from '../components/common/LanguageSwitcher'
import { sendPasswordReset } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../hooks/useTranslation'
import { isFirebaseConfigured } from '../services/firebase'
import { cn } from '../utils/cn'

/** Official multi-color Google "G" logo. */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.29-4.74 3.29-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.07H2.18a11 11 0 0 0 0 9.86L5.84 14.1z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

const inputCls =
  'w-full rounded-2xl border border-sand-200 bg-white py-3 pl-11 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:bg-sand-100'

const PERK_KEYS = [
  { icon: MapPin, titleKey: 'login.perk1.title', textKey: 'login.perk1.text' },
  { icon: Heart, titleKey: 'login.perk2.title', textKey: 'login.perk2.text' },
  { icon: BookOpen, titleKey: 'login.perk3.title', textKey: 'login.perk3.text' },
]

function BrandPanel() {
  const { t } = useTranslation()
  return (
    <div className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:p-12 dark:bg-ink-950">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-sage-500/25 blur-3xl" />

      <div className="relative flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white shadow-soft">
          <MapPin className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-extrabold tracking-tight text-white">
          Travel<span className="text-brand-400">Map</span>
        </span>
      </div>

      <div className="relative">
        <p className="max-w-sm font-display text-4xl font-extrabold leading-tight tracking-tight text-white">
          {t('app.tagline')}
        </p>
        <div className="mt-10 space-y-6">
          {PERK_KEYS.map(({ icon: Icon, titleKey, textKey }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.12 }}
              className="flex items-start gap-4"
            >
              <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-300 backdrop-blur">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-white">{t(titleKey)}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-white/55">{t(textKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="relative text-xs text-white/35">
        {t('login.footer')}
      </p>
    </div>
  )
}

function NotConfiguredCard() {
  const { t } = useTranslation()
  return (
    <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50 p-8 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-500 shadow-soft">
        <Lock className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold text-ink-900">{t('login.notConfigured.title')}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
        {t('login.notConfigured.desc')}
      </p>
      <ol className="mx-auto mt-6 max-w-sm space-y-3 text-left text-sm text-ink-600">
        {[
          [t('login.notConfigured.step1'), t('login.notConfigured.step1Rest')],
          [t('login.notConfigured.step2'), t('login.notConfigured.step2Rest')],
          [t('login.notConfigured.step3'), t('login.notConfigured.step3Rest')],
        ].map(([step, rest], i) => (
          <li key={step} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="leading-relaxed">
              <strong>{step}</strong> {rest}
            </span>
          </li>
        ))}
      </ol>
      <a
        href="https://console.firebase.google.com/"
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 dark:bg-ink-950 dark:hover:bg-white/10"
      >
        {t('login.notConfigured.openConsole')} <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}

export default function Login() {
  const { t } = useTranslation()
  const location = useLocation()
  const from = location.state?.from || '/profile'

  const { status, error, signInWithGoogle, signInWithEmail, signUpWithEmail, clearError } =
    useAuthStore()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [forgotBusy, setForgotBusy] = useState(false)
  const [forgotError, setForgotError] = useState(null)
  const [notice, setNotice] = useState(null)

  // Already signed in? Head back where the user came from. The store flips
  // status synchronously on success, so this <Navigate> handles the redirect.
  if (status === 'signedIn') return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password)
      } else {
        await signUpWithEmail(email.trim(), password)
      }
    } catch {
      // error already stored in the auth store and shown in the banner
    } finally {
      setBusy(false)
    }
  }

  const handleGoogle = async () => {
    if (busy) return
    setBusy(true)
    setNotice(null)
    try {
      const user = await signInWithGoogle()
      if (!user) setNotice(t('login.popupClosed'))
    } catch {
      // error already stored in the auth store and shown in the banner
    } finally {
      setBusy(false)
    }
  }

  const handleForgot = async () => {
    if (forgotBusy || !email.trim()) return
    setForgotBusy(true)
    setResetSent(false)
    setForgotError(null)
    try {
      await sendPasswordReset(email.trim())
      setResetSent(true)
    } catch (err) {
      setForgotError(err.message)
    } finally {
      setForgotBusy(false)
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center py-10">
        <div className="flex w-full overflow-hidden rounded-4xl bg-white shadow-lift dark:bg-sand-100">
          <BrandPanel />

          <div className="flex-1 px-6 py-10 sm:px-10 lg:px-12">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-400 transition hover:text-ink-700"
            >
              <ArrowLeft className="h-4 w-4" /> {t('login.backToApp')}
            </Link>

            <AnimatePresence mode="wait">
              {!isFirebaseConfigured ? (
                <motion.div key="unconfigured" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <NotConfiguredCard />
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                    {mode === 'signin' ? t('login.welcomeBack') : t('login.joinJourney')}
                  </h1>
                  <p className="mt-1.5 text-sm text-ink-500">
                    {mode === 'signin' ? t('login.signInSub') : t('login.signUpSub')}
                  </p>

                  {/* Mode switch */}
                  <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-sand-100 p-1">
                    {[
                      { id: 'signin', label: t('login.signIn') },
                      { id: 'signup', label: t('login.createAccount') },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setMode(id)
                          clearError()
                          setForgotError(null)
                          setNotice(null)
                          setResetSent(false)
                        }}
                        className={cn(
                          'rounded-full py-2 text-sm font-semibold transition',
                          mode === id ? 'bg-white text-ink-900 shadow-soft dark:bg-sand-50' : 'text-ink-500 hover:text-ink-700'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={busy}
                    className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-sand-200 bg-white py-3 text-sm font-semibold text-ink-800 transition hover:border-sand-300 hover:bg-sand-50 active:scale-[0.99] disabled:opacity-60 dark:bg-sand-100 dark:hover:bg-sand-200"
                  >
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleLogo />}
                    {t('login.google')}
                  </button>

                  <div className="my-6 flex items-center gap-4">
                    <span className="h-px flex-1 bg-sand-200" />
                    <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
                      {t('login.orWithEmail')}
                    </span>
                    <span className="h-px flex-1 bg-sand-200" />
                  </div>

                  {/* Error / notice banner */}
                  <AnimatePresence>
                    {(error || forgotError || notice) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                      >
                        <p
                          className={cn(
                            'rounded-2xl border px-4 py-3 text-sm font-medium',
                            notice
                              ? 'border-sand-200 bg-sand-50 text-ink-600'
                              : 'border-brand-200 bg-brand-50 text-brand-700'
                          )}
                        >
                          {notice || error || forgotError}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email/password form */}
                  <form onSubmit={submit} className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-ink-700">{t('login.email')}</span>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <input
                          type="email"
                          name="email"
                          id="login-email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={inputCls}
                          autoComplete="email"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-ink-700">{t('login.password')}</span>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                        <input
                          type="password"
                          name="password"
                          id="login-password"
                          required
                          minLength={mode === 'signup' ? 6 : undefined}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={inputCls}
                          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        />
                      </div>
                    </label>

                    {mode === 'signin' && (
                      <div className="flex items-center justify-between pt-0.5">
                        <button
                          type="button"
                          onClick={handleForgot}
                          disabled={forgotBusy}
                          className="text-xs font-medium text-ink-500 underline-offset-2 transition hover:text-brand-600 hover:underline"
                        >
                          {forgotBusy ? t('login.sending') : t('login.forgot')}
                        </button>
                        <AnimatePresence>
                          {resetSent && (
                            <motion.span
                              initial={{ opacity: 0, x: 6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-sage-600"
                            >
                              <Send className="h-3.5 w-3.5" /> {t('login.resetSent')}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 active:scale-[0.99] disabled:opacity-60"
                    >
                      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                      {mode === 'signin' ? t('login.signIn') : t('login.createAccount')}
                    </button>
                  </form>

                  <div className="mt-6 flex justify-center">
                    <LanguageSwitcher />
                  </div>

                  <p className="mt-6 text-center text-xs leading-relaxed text-ink-400">
                    {t('login.footer')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
