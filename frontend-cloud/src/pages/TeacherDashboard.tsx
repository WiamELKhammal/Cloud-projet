import React, { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'

// Define the project type
interface Project {
  title: string
  description: string
  school: string
  filiere: string
  matiere: string
  deadline: string
  status: string
  year: string
  teacher_uid: string
}

const AddProject: React.FC = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [school, setSchool] = useState('')
  const [filiere, setFiliere] = useState('')
  const [matiere, setMatiere] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState('Active')
  const [year, setYear] = useState('1st Year') // Year field
  const [teacher_uid, setteacher_uid] = useState('') // Will be set from localStorage
  const [projects, setProjects] = useState<Project[]>([]) // Projects state

  useEffect(() => {
    const storedUid = localStorage.getItem('uid')
    console.log('Retrieved UID from localStorage:', storedUid)

    if (storedUid) {
      setteacher_uid(storedUid)

      // Immediately call fetchProjects with the retrieved UID
      fetchProjects(storedUid)
    } else {
      console.error('UID not found in localStorage!')
    }
  }, [])

  // Fetch function that accepts a UID directly
  const fetchProjects = async (uid: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/teacher/${uid}`)
      const data = await response.json()

      if (data && data.length > 0) {
        setProjects(data)
        console.log('Fetched projects:', data)
      } else {
        console.warn('No projects found for this UID.')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  // Handle form submission to add a new project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!teacher_uid) {
      console.error('Teacher UID is missing')
      return
    }

    const newProject: Project = {
      title,
      description,
      school,
      filiere,
      matiere,
      deadline,
      status,
      year,
      teacher_uid, // Use snake_case here to match the backend
    }

    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      })

      if (response.ok) {
        const addedProject = await response.json()
        console.log('Project added successfully:', addedProject)

        // Add the newly added project to the list of projects
        setProjects([...projects, addedProject.project])

        // Reset form fields
        setTitle('')
        setDescription('')
        setSchool('')
        setFiliere('')
        setMatiere('')
        setDeadline('')
        setStatus('Active')
        setYear('1st Year')
      } else {
        console.error('Error adding project')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create a New Project
      </Typography>

      <form onSubmit={handleAddProject}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          label="School"
          variant="outlined"
          fullWidth
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          label="Filiere"
          variant="outlined"
          fullWidth
          value={filiere}
          onChange={(e) => setFiliere(e.target.value)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          label="Matiere"
          variant="outlined"
          fullWidth
          value={matiere}
          onChange={(e) => setMatiere(e.target.value)}
          sx={{ marginBottom: 2 }}
          required
        />
        <TextField
          label="Deadline"
          type="date"
          variant="outlined"
          fullWidth
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          sx={{ marginBottom: 2 }}
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl fullWidth sx={{ marginBottom: 2 }} required>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} label="Status">
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        {/* Year Dropdown */}
        <FormControl fullWidth sx={{ marginBottom: 2 }} required>
          <InputLabel>Year</InputLabel>
          <Select value={year} onChange={(e) => setYear(e.target.value)} label="Year">
            <MenuItem value="1st Year">1st Year</MenuItem>
            <MenuItem value="2nd Year">2nd Year</MenuItem>
            <MenuItem value="3rd Year">3rd Year</MenuItem>
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary">
          Add Project
        </Button>
      </form>

      <Typography variant="h5" sx={{ marginTop: 4 }}>
        Project List
      </Typography>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Filiere</TableCell>
              <TableCell>Matiere</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Year</TableCell> {/* Added year column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project, index) => (
              <TableRow key={index}>
                <TableCell>{project.title}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>{project.school}</TableCell>
                <TableCell>{project.filiere}</TableCell>
                <TableCell>{project.matiere}</TableCell>
                <TableCell>{project.deadline}</TableCell>
                <TableCell>{project.status}</TableCell>
                <TableCell>{project.year}</TableCell> {/* Displaying year */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default AddProject
