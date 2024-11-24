import React, { useState } from 'react'
import { useRouter } from 'next/router' // Import useRouter from next/router
import Box from '@mui/material/Box'
import { StyledButton } from '@/components/styled-button'

import Modal from '@mui/material/Modal'
import { Typography } from '@mui/material'
import SignUpForm from '@/components/auth/SignupForm'
import SignInForm from '@/components/auth/SigninForm'
import Button from '@mui/material/Button'

const AuthNavigation = () => {
  const [role, setRole] = useState<'student' | 'teacher' | null>(null)
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin')
  const router = useRouter() // Use useRouter hook from Next.js

  const handleRoleSelect = (selectedRole: 'student' | 'teacher') => {
    setRole(selectedRole)
  }

  const closeModal = () => {
    setRole(null)
    setAuthType('signin') // Reset to Sign In for the next open
  }

  // Example of navigation using Next.js router
  const handleNavigation = (path: string) => {
    router.push(path) // Navigate to the specified path
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Role Selection */}
      <Box sx={{ marginBottom: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => handleRoleSelect('student')}>
          I'm a Student
        </Button>
        <Button variant="contained" color="secondary" onClick={() => handleRoleSelect('teacher')}>
          I'm a Teacher
        </Button>
      </Box>

      {/* Modal */}
      <Modal
        open={role !== null}
        onClose={closeModal}
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
            width: '400px',
            maxWidth: '90%',
          }}
        >
          {authType === 'signin' ? (
            <SignInForm closeModal={closeModal} role={role!} switchToSignUp={() => setAuthType('signup')} />
          ) : (
            <SignUpForm closeModal={closeModal} role={role!} switchToSignIn={() => setAuthType('signin')} />
          )}
        </Box>
      </Modal>
    </Box>
  )
}

export default AuthNavigation
