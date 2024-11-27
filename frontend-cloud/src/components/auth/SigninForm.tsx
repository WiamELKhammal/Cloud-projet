import React, { useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { auth } from '@/firebase'
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import GoogleIcon from '@mui/icons-material/Google'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useUser } from '@/context/user-context'

// Fetch user data from the backend
const getUser = async (uid: string) => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${uid}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error('User not found in the database.')
    }

    const data = await response.json()
    console.log('User data:', data)
    return data
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

interface SignInFormProps {
  closeModal: () => void
  role: 'student' | 'teacher'
  switchToSignUp: () => void
  onLogin: (user: any) => void
}

const SignInForm: React.FC<SignInFormProps> = ({ closeModal, role, switchToSignUp, onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useUser()

  // Handle email/password sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Save uid in localStorage
      localStorage.setItem('uid', user.uid)

      const userData = await getUser(user.uid)
      if (userData) {
        // Proceed with your logic
        onLogin(userData)
        closeModal()
      } else {
        setError('No matching user data found in the backend. Please sign up first.')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('SignIn Error:', err.message)
        setError('Invalid email or password. Please try again.')
      } else {
        console.error('Unexpected SignIn Error:', err)
        setError('An unexpected error occurred. Please try again.')
      }
    }
  }

  // Handle third-party sign-in (Google/GitHub) with user verification
  const handleProviderSignIn = async (provider: any) => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Verify if the user exists in the backend
      const userData = await getUser(user.uid)
      if (userData) {
        // Check if the role from the backend matches the selected role
        if (userData.role !== role) {
          setError(
            `You signed up as a ${userData.role}, but you're trying to log in as a ${role}. Please log in with the correct role.`
          )
          await auth.currentUser?.delete() // Optionally remove the Firebase user if the role doesn't match
          return
        }

        // Proceed with successful login
        setUser({ ...user, role: userData.role })
        onLogin(user)
        closeModal()
      } else {
        setError('User not found in the database. Please sign up first.')
        await auth.currentUser?.delete() // Remove Firebase user if backend verification fails
      }
    } catch (err: any) {
      console.error(`${provider.providerId} Sign-In Error:`, err.message)
      setError('Failed to sign in. Please try again.')
    }
  }

  return (
    <Box>
      <form onSubmit={handleSignIn}>
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" fullWidth variant="contained" color="primary">
          Sign In
        </Button>
      </form>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          startIcon={<GoogleIcon />}
          onClick={() => handleProviderSignIn(new GoogleAuthProvider())}
        >
          Google
        </Button>
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          startIcon={<GitHubIcon />}
          onClick={() => handleProviderSignIn(new GithubAuthProvider())}
        >
          GitHub
        </Button>
      </Box>

      <Typography
        variant="body2"
        align="center"
        sx={{ mt: 2, cursor: 'pointer', color: 'blue' }}
        onClick={switchToSignUp}
      >
        Don't have an account? Sign Up
      </Typography>
    </Box>
  )
}

export default SignInForm
