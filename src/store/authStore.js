import { create } from 'zustand'
import {
  isAuthReady,
  onAuthChange,
  signInWithEmail as emailSignIn,
  signInWithGoogle as googleSignIn,
  signOutUser,
  signUpWithEmail as emailSignUp,
  toAppUser,
} from '../services/authService'
import { useUserStore } from './userStore'

let subscribed = false

let photoRetryUid = null

function prefillProfileFromUser(user) {
  if (!user) return
  const profile = useUserStore.getState().profile
  const patch = {}
  if (!profile.name && user.name) patch.name = user.name
  if (!profile.avatar && user.avatar) patch.avatar = user.avatar
  if (!profile.username && user.email) patch.username = user.email.split('@')[0]
  if (!profile.joinedAt) patch.joinedAt = new Date().toISOString()
  if (Object.keys(patch).length > 0) useUserStore.getState().updateProfile(patch)
}

export const useAuthStore = create((set, get) => ({
  status: 'loading',
  user: null,
  error: null,

  init() {
    if (subscribed) return
    subscribed = true
    if (!isAuthReady()) {
      set({ status: 'unconfigured', user: null })
      return
    }
    onAuthChange(async (firebaseUser) => {
      const user = toAppUser(firebaseUser)
      set({ user, status: user ? 'signedIn' : 'signedOut', error: null })
      if (user) prefillProfileFromUser(user)
      // Sessions created before the photo fallback restore with a missing
      // Google picture — refresh the account profile once so it's captured.
      const profile = useUserStore.getState().profile
      if (firebaseUser && !user.avatar && !profile.avatar && photoRetryUid !== firebaseUser.uid) {
        photoRetryUid = firebaseUser.uid
        try {
          await firebaseUser.reload()
          const refreshed = toAppUser(firebaseUser)
          if (refreshed.avatar) {
            set({ user: refreshed, status: 'signedIn' })
            prefillProfileFromUser(refreshed)
          }
        } catch {
        }
      }
    }, () => {
      set({ user: null, status: 'signedOut' })
    })
  },

  clearError: () => set({ error: null }),

  async signInWithGoogle() {
    set({ error: null })
    try {
      const user = await googleSignIn()
      if (user) set({ user: toAppUser(user), status: 'signedIn' })
      return user
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  async signInWithEmail(email, password) {
    set({ error: null })
    try {
      const user = await emailSignIn(email, password)
      set({ user: toAppUser(user), status: 'signedIn' })
      return user
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  async signUpWithEmail(email, password) {
    set({ error: null })
    try {
      const user = await emailSignUp(email, password)
      set({ user: toAppUser(user), status: 'signedIn' })
      return user
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  async signOut() {
    try {
      await signOutUser()
      set({ user: null, status: 'signedOut' })
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },
}))
