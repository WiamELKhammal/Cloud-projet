/* eslint-disable @typescript-eslint/explicit-function-return-type */
// src/components/auth/GoogleSignInButton.tsx
import React from 'react'
import { auth, GoogleAuthProvider, signInWithPopup } from '@/firebase' // Import the necessary functions from firebase

const GoogleSignInButton = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider() // Use the modular GoogleAuthProvider
    try {
      const result = await signInWithPopup(auth, provider) // Use signInWithPopup with 'auth' and 'provider'
      const user = result.user
      console.log('User signed in with Google:', user)
      // You can redirect or perform any other actions with the user data here
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error signing in with Google:', err.message)
      } else {
        console.error('An unknown error occurred')
      }
    }
  }

  return <button onClick={handleGoogleSignIn}>Sign In with Google</button>
}

export default GoogleSignInButton
