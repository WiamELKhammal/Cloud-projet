import React, { useEffect, useState } from 'react'
import { Box, Typography, TextField, Button } from '@mui/material'
import { useUser } from '@/context/user-context' // Assuming you're using context to manage user state
import { getUser } from '@/api/userApi'

const ProfilePage = () => {
  const { user } = useUser() // Assuming you're using context to store logged-in user data
  const [profileData, setProfileData] = useState<any>(null) // Store fetched user profile data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (user?.uid) {
      // Fetch user profile data when the component mounts
      const fetchProfile = async () => {
        try {
          const data = await getUser(user.uid) // Fetch user data based on UID
          setProfileData(data)
        } catch (err) {
          setError('Error fetching user profile')
        } finally {
          setLoading(false)
        }
      }

      fetchProfile()
    }
  }, [user])

  const handleUpdate = async () => {
    // Handle profile update functionality (optional)
    console.log('Updating profile...')
    // You would send the updated data to your backend here
  }

  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4">Profile</Typography>
      {profileData && (
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={profileData.name || ''}
            margin="normal"
            disabled
          />
          <TextField
            label="School"
            variant="outlined"
            fullWidth
            value={profileData.school || ''}
            margin="normal"
            disabled
          />
          <TextField
            label="Year"
            variant="outlined"
            fullWidth
            value={profileData.year || ''}
            margin="normal"
            disabled
          />
          <TextField
            label="Filière"
            variant="outlined"
            fullWidth
            value={profileData.filiere || ''}
            margin="normal"
            disabled
          />

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleUpdate} // For updating profile (optional)
          >
            Update Profile
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default ProfilePage
