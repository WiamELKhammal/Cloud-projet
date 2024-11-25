import axios from 'axios'
import { initializeApp, getApp, FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GithubAuthProvider,
} from 'firebase/auth'

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyDucWRZaQcnjEPWwsh541CGwrQ_K73j59M',
  authDomain: 'educollab-e8e5c.firebaseapp.com',
  projectId: 'educollab-e8e5c',
  storageBucket: 'educollab-e8e5c.appspot.com',
  messagingSenderId: '399469077407',
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

// Sign in with Google
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log('Google Sign-In successful', user)
    // Store user data in Firestore or backend
    return user
  } catch (error: any) {
    console.error('Error signing in with Google: ', error.message)
  }
}

// Sign in with GitHub
const signInWithGitHub = async () => {
  const provider = new GithubAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log('GitHub Sign-In successful', user)
    // Store user data in Firestore or backend
    return user
  } catch (error: any) {
    console.error('Error signing in with GitHub: ', error.message)
  }
}

// Sign in with Email and Password
const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    console.log('Email Sign-In successful', user)
    // Store user data in Firestore or backend
    return user
  } catch (error: any) {
    console.error('Error signing in with email: ', error.message)
  }
}

// Create user with email and password
const signUpWithEmail = async (email: string, password: string, role: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Send user data to backend
    try {
      const response = await axios.post('http://localhost:5000/api/users', {
        uid: user.uid,
        email: user.email,
        role,
      })
      console.log('User stored in database:', response.data)
    } catch (backendError: any) {
      if (backendError.response?.status === 409) {
        console.error('User already exists in the database.')
      } else {
        console.error('Error storing user in database:', backendError.message)
      }
    }

    return user
  } catch (authError: any) {
    if (authError.code === 'auth/email-already-in-use') {
      console.error('This email is already in use.')
    } else if (authError.code === 'auth/weak-password') {
      console.error('Password is too weak.')
    } else {
      console.error('Error signing up with email:', authError.message)
    }
  }
}

export {
  auth,
  signInWithGoogle,
  signInWithGitHub,
  signInWithEmail,
  signUpWithEmail,
  signInWithPopup,
  GoogleAuthProvider,
}
