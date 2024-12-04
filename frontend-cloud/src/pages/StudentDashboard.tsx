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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import axios from 'axios'

interface Project {
  id: string
  title: string
  description: string
  school: string
  filiere: string
  matiere: string
  deadline: string
  status: string
  year: string
  fileId?: string
}

const getStatusDetails = (status: string) => {
  switch (status) {
    case 'En cours de réalisation':
      return { label: 'En cours de réalisation', color: 'lightblue' }
    case 'Progression à 25%':
      return { label: 'Progression à 25%', color: 'yellow' }
    case 'Progression à 50%':
      return { label: 'Progression à 50%', color: 'orange' }
    case 'Progression à 75%':
      return { label: 'Progression à 75%', color: 'green' }
    case 'Finalisation des livrables':
      return { label: 'Finalisation des livrables', color: 'blue' }
    case 'Tests finaux':
      return { label: 'Tests finaux', color: 'purple' }
    case 'Validation du projet':
      return { label: 'Validation du projet', color: 'teal' }
    case 'Préparation à la livraison':
      return { label: 'Préparation à la livraison', color: 'red' }
    case 'Projet livré':
      return { label: 'Projet livré', color: 'green' }
    default:
      return { label: 'Active', color: 'gray' }
  }
}

const StudentDashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    school: '',
    filiere: '',
    matiere: '',
    year: '',
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Fetch projects based on filters
  const fetchFilteredProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects', {
        params: filters,
      })
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name as string]: value,
    }))
  }

  // Handle status change
  // Function to update project status via API
  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/projects/${projectId}/status`, {
        status,
      })
      return response.data
    } catch (error) {
      console.error('Error updating project status:', error)
      throw error
    }
  }

  // Handle status change
  const handleStatusChange = async () => {
    if (!editingProjectId || !newStatus) return

    try {
      await updateProjectStatus(editingProjectId, newStatus)
      alert('Status updated successfully!')
      setEditDialogOpen(false)
      fetchFilteredProjects() // Refresh the project list
    } catch (error) {
      alert('Failed to update status. Please try again.')
    }
  }

  // Open edit dialog
  const openEditDialog = (projectId: string, currentStatus: string) => {
    setEditingProjectId(projectId)
    setNewStatus(currentStatus)
    setEditDialogOpen(true)
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Student Dashboard - Filter Projects
      </Typography>

      {/* Filter Section */}
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <TextField
          label="School"
          name="school"
          variant="outlined"
          value={filters.school}
          onChange={handleFilterChange}
        />
        <TextField
          label="Filiere"
          name="filiere"
          variant="outlined"
          value={filters.filiere}
          onChange={handleFilterChange}
        />
        <TextField
          label="Matiere"
          name="matiere"
          variant="outlined"
          value={filters.matiere}
          onChange={handleFilterChange}
        />
        <FormControl variant="outlined">
          <InputLabel>Year</InputLabel>
          <Select name="year" value={filters.year} onChange={handleFilterChange} label="Year">
            <MenuItem value="">All Years</MenuItem>
            <MenuItem value="1st Year">1st Year</MenuItem>
            <MenuItem value="2nd Year">2nd Year</MenuItem>
            <MenuItem value="3rd Year">3rd Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Button variant="contained" color="primary" onClick={fetchFilteredProjects}>
        Search Projects
      </Button>

      {/* Project List Table */}
      <Typography variant="h6" sx={{ marginTop: 4 }}>
        Project Results
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
              <TableCell>Actions</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>File</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => {
              const statusDetails = getStatusDetails(project.status)
              return (
                <TableRow key={project.id}>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>{project.school}</TableCell>
                  <TableCell>{project.filiere}</TableCell>
                  <TableCell>{project.matiere}</TableCell>
                  <TableCell>{project.deadline}</TableCell>
                  <TableCell>
                    {statusDetails && (
                      <Chip
                        label={statusDetails.label}
                        icon={<span>{statusDetails.icon}</span>}
                        sx={{ backgroundColor: statusDetails.color, color: 'white' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEditDialog(project.id, project.status)}>
                      <Edit />
                    </IconButton>
                  </TableCell>
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
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Project Status</DialogTitle>
        <DialogContent>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as string)} label="Status">
              <MenuItem value="En cours de réalisation">En cours de réalisation</MenuItem>
              <MenuItem value="Progression à 25%">Progression à 25%</MenuItem>
              <MenuItem value="Progression à 50%">Progression à 50%</MenuItem>
              <MenuItem value="Progression à 75%">Progression à 75%</MenuItem>
              <MenuItem value="Finalisation des livrables">Finalisation des livrables</MenuItem>
              <MenuItem value="Tests finaux">Tests finaux</MenuItem>
              <MenuItem value="Validation du projet">Validation du projet</MenuItem>
              <MenuItem value="Préparation à la livraison">Préparation à la livraison</MenuItem>
              <MenuItem value="Projet livré">Projet livré</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleStatusChange} color="secondary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StudentDashboard
