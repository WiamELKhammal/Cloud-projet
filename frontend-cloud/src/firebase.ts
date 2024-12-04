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
  apiKey: 'AIzaSyDH9GSIWM4Ca8SLzIbjEPIRo8_Mt9k4B0k',
  authDomain: 'educollab-1d250.firebaseapp.com',
  projectId: 'educollab-1d250',
  storageBucket: 'educollab-1d250.appspot.com',
  messagingSenderId: '739298747298',
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
