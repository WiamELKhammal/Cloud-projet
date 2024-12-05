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
import axios from 'axios'

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
  fileId?: string
}

const AddProject: React.FC = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [school, setSchool] = useState('')
  const [filiere, setFiliere] = useState('')
  const [matiere, setMatiere] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState('Active')
  const [year, setYear] = useState('1st Year')
  const [teacher_uid, setTeacherUid] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Fetch UID from localStorage and fetch projects for that UID
  useEffect(() => {
    const storedUid = localStorage.getItem('uid')
    if (storedUid) {
      setTeacherUid(storedUid)
      fetchProjects(storedUid)
    } else {
      console.error('UID not found in localStorage!')
    }
  }, [])

  // Fetch projects based on teacher UID
  const fetchProjects = async (uid: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/teacher/${uid}`)
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  // Handle form submission to add a project
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
      teacher_uid,
      fileId: '', // Placeholder for file ID
    }

    try {
      const formData = new FormData()

      // Append project data directly without stringifying
      for (const key in newProject) {
        formData.append(key, newProject[key])
      }

      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      // Debug: Log formData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }

      const response = await axios.post('http://localhost:5000/api/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data && response.data.project) {
        setProjects([...projects, response.data.project])
      } else {
        console.error('Failed to add project')
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
        {/* Form fields for project details */}
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
          InputLabelProps={{ shrink: true }}
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

        {/* File Upload */}
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
          style={{ marginBottom: '16px' }}
        />
        {selectedFile && (
          <Typography variant="body2" color="textSecondary">
            Selected file: {selectedFile.name}
          </Typography>
        )}

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
              <TableCell>Year</TableCell>
              <TableCell>File</TableCell>
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
                <TableCell>{project.year}</TableCell>
                <TableCell>
                  {project.fileId && (
                    <a
                      href={`http://localhost:5000/api/files/${project.fileId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default AddProject
