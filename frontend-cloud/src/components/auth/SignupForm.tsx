import React, { useState } from 'react'
import Box from '@mui/material/Box'
import { TextField, Button, Typography } from '@mui/material'
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material'
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'
import axios from 'axios'

interface SignUpFormProps {
  closeModal: () => void
  role: 'student' | 'teacher'
  switchToSignIn: () => void
  onLogin: (user: any) => void
}

const SignUpForm: React.FC<SignUpFormProps> = ({ closeModal, role, switchToSignIn, onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Ensure the function is being called correctly to store the user in the database
  const storeUserInDb = async (user: any, rawPassword: string) => {
    try {
      const payload = {
        uid: user.uid,
        email: user.email,
        role, // Assuming role is passed during sign-up
        name: user.name || null,
        password: rawPassword ? rawPassword : null, // Send null if password is empty (for Google/GitHub)
      }
      console.log('Sending payload to backend:', payload)

      const response = await axios.post('http://localhost:5000/api/users', payload)

      console.log('User stored in DB:', response.data)
      setSuccessMessage('User stored in the database successfully!')
    } catch (err: any) {
      console.error('Error storing user in DB:', err.response?.data || err.message)
      setError(err.response?.data?.message || 'There was an issue storing user data. Please try again.')
    }
  }

  const handleEmailPasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation for email and password
    if (!email || !password) {
      setError('Please fill in both email and password fields.')
      return
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user
      onLogin(user) // Call onLogin with user data

      // Store user in DB (this is where it might have failed)
      await storeUserInDb(user, password) // Send raw password to the backend

      closeModal()
    } catch (err: any) {
      console.error('Error signing up with email and password: ', err.message)
      setError('Error signing up. Please check your email and password and try again.')
    }
  }

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Save uid in localStorage
      localStorage.setItem('uid', user.uid)

      const userData = await storeUserInDb(user, '') // Assuming storeUserInDb handles social logins
      onLogin(userData)
      closeModal()
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error signing up with Google: ', err.message)
        setError('Error signing up with Google. Please try again.')
      } else {
        console.error('Unexpected error signing up with Google: ', err)
        setError('An unexpected error occurred. Please try again.')
      }
    }
  }

  const handleGitHubSignUp = async () => {
    const provider = new GithubAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      onLogin(user)

      // Store user in DB
      await storeUserInDb(user, '') // GitHub sign-up doesn't have a password, so pass empty string

      closeModal()
    } catch (err: any) {
      console.error('Error signing up with GitHub: ', err.message)
      setError('Error signing up with GitHub. Please try again.')
    }
  }

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Sign Up as {role === 'student' ? 'Student' : 'Teacher'}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <Button variant="outlined" color="primary" startIcon={<GoogleIcon />} onClick={handleGoogleSignUp}>
          Sign up with Google
        </Button>
        <Button variant="outlined" color="inherit" startIcon={<GitHubIcon />} onClick={handleGitHubSignUp}>
          Sign up with GitHub
        </Button>
      </Box>
      <form onSubmit={handleEmailPasswordSignUp}>
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
        <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
          Sign Up
        </Button>
      </form>
      {error && (
        <Typography color="error" align="center" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {successMessage && (
        <Typography color="success" align="center" sx={{ mt: 2 }}>
          {successMessage}
        </Typography>
      )}
      <Typography align="center" sx={{ mt: 2 }}>
        Already have an account? <Button onClick={switchToSignIn}>Sign In</Button>
      </Typography>
    </Box>
  )
}

export default SignUpForm
