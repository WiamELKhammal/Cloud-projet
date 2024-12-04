import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import SignUpForm from '@/components/auth/SignupForm'
import SignInForm from '@/components/auth/SigninForm'
import { AccountCircle, School, Person, ArrowDropDown } from '@mui/icons-material'

const AuthNavigation = () => {
  const [role, setRole] = useState<'student' | 'teacher' | null>(null)
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin')
  const [loggedInUser, setLoggedInUser] = useState<{
    name: string
    email: string
    role: 'student' | 'teacher'
  } | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()

  // Load user from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('loggedInUser')
      if (savedUser) {
        setLoggedInUser(JSON.parse(savedUser))
      }
    }
  }, [])

  const handleRoleSelect = (selectedRole: 'student' | 'teacher') => {
    setRole(selectedRole)
  }

  const closeModal = () => {
    setRole(null)
    setAuthType('signin') // Reset to Sign In for the next open
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser')
    }
    router.push('/') // Redirect to homepage after logout
  }

  const handleLogin = (user: { name: string; email: string; role: 'student' | 'teacher' }) => {
    setLoggedInUser(user)
    if (typeof window !== 'undefined') {
      localStorage.setItem('loggedInUser', JSON.stringify(user))
    }
    closeModal()
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
      {!loggedInUser ? (
        // Role Selection Buttons
        <Box sx={{ marginBottom: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => handleRoleSelect('student')}>
            I'm a Student
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleRoleSelect('teacher')}>
            I'm a Teacher
          </Button>
        </Box>
      ) : (
        // Logged-in User Dropdown with Icon
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: loggedInUser.role === 'teacher' ? 'secondary.main' : 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginRight: 1,
            }}
          >
            {loggedInUser.role === 'teacher' ? <Person fontSize="small" /> : <School fontSize="small" />}
          </Box>
          <Button
            variant="text"
            color="inherit"
            onClick={handleMenuClick}
            endIcon={<ArrowDropDown />}
            sx={{ textTransform: 'none' }}
          >
            {loggedInUser.name || loggedInUser.email}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {loggedInUser.role === 'teacher' && (
              <MenuItem onClick={() => router.push('/TeacherDashboard')}>Profile</MenuItem>
            )}

            {loggedInUser.role === 'teacher' && <MenuItem onClick={() => router.push('/Calendar')}>Calendar</MenuItem>}
            {loggedInUser.role === 'student' && (
              <MenuItem onClick={() => router.push('/StudentDashboard')}>Profile</MenuItem>
            )}
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>

           
        </Box>
      )}

      {/* Modal for Sign In / Sign Up */}
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
            <SignInForm
              closeModal={closeModal}
              role={role!}
              switchToSignUp={() => setAuthType('signup')}
              onLogin={handleLogin}
            />
          ) : (
            <SignUpForm
              closeModal={closeModal}
              role={role!}
              switchToSignIn={() => setAuthType('signin')}
              onLogin={handleLogin}
            />
          )}
        </Box>
      </Modal>
    </Box>
  )
}

export default AuthNavigation
