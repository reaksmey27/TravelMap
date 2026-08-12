import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './firebase'

export function friendlyAuthError(err) {
  const code = err?.code || ''
  const map = {
    'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/popup-closed-by-user': 'The sign-in window was closed before finishing.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email. Sign in with your email and password instead.',
    'auth/operation-not-allowed':
      'This sign-in method is not enabled. Enable it in the Firebase console under Authentication → Sign-in method.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  }
  return map[code] || err?.message || 'Something went wrong. Please try again.'
}

export const isAuthReady = () => isFirebaseConfigured && Boolean(auth)

export async function signInWithGoogle() {
  if (!isAuthReady()) throw new Error('Firebase is not configured yet.')
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    // Known Firebase quirk: Google sign-in often returns a null photoURL even
    // though the profile picture is in the OAuth response. Fall back to it so
    // the avatar is captured on first sign-in.
    if (user && !user.photoURL) {
      const picture =
        getAdditionalUserInfo(result)?.profile?.picture || result._tokenResponse?.photoUrl
      if (picture) user.photoURL = picture
    }
    return user
  } catch (err) {
    if (err?.code === 'auth/popup-closed-by-user') return null // user cancelled — not an error
    throw new Error(friendlyAuthError(err))
  }
}

export async function signUpWithEmail(email, password) {
  if (!isAuthReady()) throw new Error('Firebase is not configured yet.')
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    return credential.user
  } catch (err) {
    throw new Error(friendlyAuthError(err))
  }
}

export async function signInWithEmail(email, password) {
  if (!isAuthReady()) throw new Error('Firebase is not configured yet.')
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  } catch (err) {
    throw new Error(friendlyAuthError(err))
  }
}

export async function sendPasswordReset(email) {
  if (!isAuthReady()) throw new Error('Firebase is not configured yet.')
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (err) {
    throw new Error(friendlyAuthError(err))
  }
}

export async function signOutUser() {
  if (!isAuthReady()) return
  try {
    await signOut(auth)
  } catch (err) {
    throw new Error(friendlyAuthError(err))
  }
}

export function onAuthChange(callback, errorCallback) {
  if (!isAuthReady()) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback, errorCallback)
}

export function toAppUser(firebaseUser) {
  if (!firebaseUser) return null
  // photoURL is often null for Google sign-ins; the provider entry keeps its
  // own copy of the picture, so use it as a last-resort fallback.
  const avatar =
    firebaseUser.photoURL ||
    firebaseUser.providerData?.find((p) => p?.photoURL)?.photoURL ||
    ''
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
    avatar,
  }
}
