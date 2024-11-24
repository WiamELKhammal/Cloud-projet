import React, { useState } from 'react'
import { auth } from '@/firebase'
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import { Box, Button, TextField, Typography } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useUser } from '@/context/user-context'

interface SignInFormProps {
  closeModal: () => void
  role: 'student' | 'teacher'
  switchToSignUp: () => void
}

const SignInForm: React.FC<SignInFormProps> = ({ closeModal, role, switchToSignUp }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useUser() // Get setUser from context

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      console.log('User signed in successfully')
      closeModal() // Close the modal after successful sign in
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      setUser(user) // Set user in context
      console.log('User signed in with Google')
      closeModal() // Close the modal after successful sign in with Google
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleGitHubSignIn = async () => {
    const provider = new GithubAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      setUser(user) // Set user in context
      console.log('User signed in with GitHub')
      closeModal() // Close the modal after successful sign in with GitHub
    } catch (err: any) {
      setError(err.message)
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

      {/* Social Logins */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <Button fullWidth variant="outlined" color="secondary" startIcon={<GoogleIcon />} onClick={handleGoogleSignIn}>
          Google
        </Button>
        <Button fullWidth variant="outlined" color="secondary" startIcon={<GitHubIcon />} onClick={handleGitHubSignIn}>
          GitHub
        </Button>
      </Box>

      {/* Link to Sign Up */}
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
