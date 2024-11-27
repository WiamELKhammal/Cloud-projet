import React, { useState, useEffect } from 'react'
import { Button, TextField, Grid, Typography, Container, Box, List, ListItem, IconButton } from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import axios from 'axios'

const MyProfile: React.FC = () => {
  const [school, setSchool] = useState('')
  const [filiere, setFiliere] = useState('')
  const [year, setYear] = useState('')
  const [classes, setClasses] = useState<{ school: string; filiere: string; year: string }[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uid, setUid] = useState(localStorage.getItem('uid') || '')

  // Charger les classes à partir de l'API
  useEffect(() => {
    const fetchClasses = async () => {
      if (!uid) {
        setError('User ID not found in localStorage.')
        return
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/profile/${uid}`)
        if (response.status === 200) {
          setClasses(response.data.classes || [])
        }
      } catch (err: any) {
        setError('Error fetching classes: ' + err.response?.data?.message || err.message)
      }
    }

    fetchClasses()
  }, [uid])

  const handleAddClass = () => {
    if (!school || !filiere || !year) {
      setError('All fields are required to add a class.')
      return
    }

    setClasses([...classes, { school, filiere, year }])
    setSchool('')
    setFiliere('')
    setYear('')
    setError('')
  }

  const handleRemoveClass = (index: number) => {
    setClasses(classes.filter((_, i) => i !== index))
  }

  const handleSaveProfile = async () => {
    if (!uid) {
      setError('User ID is required.')
      return
    }

    try {
      const response = await axios.put('http://localhost:5000/api/profile', {
        uid,
        classes,
      })

      if (response.status === 200) {
        setSuccess('Profile updated successfully.')
        setError('')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.')
      setSuccess('')
    }
  }

  return (
    <Container>
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          Update Your Profile
        </Typography>

        {/* Section pour ajouter une classe */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="School"
              variant="outlined"
              fullWidth
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Filière"
              variant="outlined"
              fullWidth
              value={filiere}
              onChange={(e) => setFiliere(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Year"
              variant="outlined"
              fullWidth
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" onClick={handleAddClass}>
              Add Class
            </Button>
          </Grid>
        </Grid>

        {/* Section pour afficher les classes gérées */}
        {classes.length > 0 && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h5" gutterBottom>
              Managed Classes
            </Typography>
            <List>
              {classes.map((cls, index) => (
                <ListItem key={index}>
                  {cls.school} - {cls.filiere} - {cls.year}
                  <IconButton onClick={() => handleRemoveClass(index)}>
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Messages d'erreur ou de succès */}
        {error && (
          <Typography color="error" sx={{ marginTop: 2 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success" sx={{ marginTop: 2 }}>
            {success}
          </Typography>
        )}

        {/* Bouton pour sauvegarder les modifications */}
        <Button variant="contained" color="primary" onClick={handleSaveProfile} sx={{ marginTop: 4 }}>
          Save Profile
        </Button>
      </Box>
    </Container>
  )
}

export default MyProfile
