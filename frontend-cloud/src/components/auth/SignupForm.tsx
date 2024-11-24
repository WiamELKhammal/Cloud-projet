import React, { useState } from 'react'
import Box from '@mui/material/Box'
import { TextField, Button, Typography } from '@mui/material'
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material'
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/firebase'
import { useUser } from '@/context/user-context'

interface SignUpFormProps {
  closeModal: () => void
  role: 'student' | 'teacher'
  switchToSignIn: () => void
}

const SignUpForm: React.FC<SignUpFormProps> = ({ closeModal, role, switchToSignIn }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useUser() // Get setUser from context

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Signing up as', role, email, password)
    closeModal()
  }

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider()

    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      setUser(user) // Set user in context
      console.log('Google sign up successful', user)
      closeModal()
    } catch (err: any) {
      console.error('Error signing up with Google: ', err.message)
      setError(err.message)
    }
  }

  const handleGitHubSignUp = async () => {
    const provider = new GithubAuthProvider()

    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      setUser(user) // Set user in context
      console.log('GitHub sign up successful', user)
      closeModal()
    } catch (err: any) {
      console.error('Error signing up with GitHub: ', err.message)
      setError(err.message)
    }
  }

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Sign Up as {role === 'student' ? 'Student' : 'Teacher'}
      </Typography>

      {/* Social Logins */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <Button variant="outlined" color="primary" startIcon={<GoogleIcon />} onClick={handleGoogleSignUp}>
          Sign up with Google
        </Button>
        <Button variant="outlined" color="inherit" startIcon={<GitHubIcon />} onClick={handleGitHubSignUp}>
          Sign up with GitHub
        </Button>
      </Box>

      {/* Email/Password Form */}
      <form onSubmit={handleSignUp}>
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

      {/* Error Message */}
      {error && (
        <Typography color="error" align="center" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Typography
        variant="body2"
        align="center"
        sx={{ mt: 2, cursor: 'pointer', color: '#386fbf' }}
        onClick={switchToSignIn}
      >
        Already have an account? Sign In
      </Typography>
    </Box>
  )
}

export default SignUpForm
