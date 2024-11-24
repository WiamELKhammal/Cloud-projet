import { initializeApp, getApp, FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GithubAuthProvider,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDucWRZaQcnjEPWwsh541CGwrQ_K73j59M',
  authDomain: 'educollab-e8e5c.firebaseapp.com',
  projectId: 'educollab-e8e5c',
  storageBucket: 'educollab-e8e5c.appspot.com',
  messagingSenderId: '399469077407',
  // Optional, only required for Analytics
}

// Initialize Firebase only if it hasn't been initialized yet
let app: FirebaseApp
try {
  app = getApp() // If the app is already initialized, this will not throw an error
} catch (error) {
  app = initializeApp(firebaseConfig) // Initialize app if it doesn't exist yet
}

// Get Firebase Auth instance
const auth = getAuth(app)

export {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GithubAuthProvider,
}
