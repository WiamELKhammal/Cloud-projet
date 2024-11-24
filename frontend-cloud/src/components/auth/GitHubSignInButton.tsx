/* eslint-disable @typescript-eslint/explicit-function-return-type */
// src/components/auth/GitHubSignInButton.tsx
import React from 'react'
import { auth } from '@/firebase' // Correct named import of 'auth'
import { GithubAuthProvider, signInWithPopup } from 'firebase/auth' // Import signInWithPopup and GithubAuthProvider

const GitHubSignInButton: React.FC = () => {
  const handleGitHubSignIn = async () => {
    const provider = new GithubAuthProvider() // GitHub provider
    try {
      const result = await signInWithPopup(auth, provider) // Sign in with popup using auth
      const user = result.user
      console.log('User signed in with GitHub:', user)
      // Handle user info (e.g., redirect or store user data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message) // Handle error properly
      } else {
        console.error('An unknown error occurred')
      }
    }
  }

  return <button onClick={handleGitHubSignIn}>Sign In with GitHub</button>
}

export default GitHubSignInButton
