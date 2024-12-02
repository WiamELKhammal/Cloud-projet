import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import axios from 'axios';

// Define the project type
interface Project {
  id: string;
  title: string;
  description: string;
  school: string;
  filiere: string;
  matiere: string;
  deadline: string;
  status: string;
  year: string;
  fileId?: string;
}

// Define the deliverable type
interface Deliverable {
  id: string;
  deliverable_name: string;
  project_id: string;
  created_at: string;
}

const StudentDashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    school: '',
    filiere: '',
    matiere: '',
    year: '',
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [deliverable, setDeliverable] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  // Fetch projects based on filters
  const fetchFilteredProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects', {
        params: filters,
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name as string]: value,
    }));
  };

  // Handle deliverable submission
  const handleDeliverableSubmit = async () => {
    if (!selectedProject) {
      alert('Please select a project to add a deliverable.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/deliverables', {
        deliverable_name: deliverable,
        project_id: selectedProject,
      });
      alert('Deliverable added successfully!');
      setDeliverable('');
      setSelectedProject('');
    } catch (error) {
      console.error('Error adding deliverable:', error);
    }
  };

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
          <Select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            label="Year"
          >
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
              <TableCell>Year</TableCell>
              <TableCell>File</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
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

      {/* Deliverable Section */}
      <Typography variant="h6" sx={{ marginTop: 4 }}>
        Add Deliverable
      </Typography>
      <FormControl variant="outlined" fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Project</InputLabel>
        <Select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value as string)}
          label="Project"
        >
          <MenuItem value="">
            <em>Select a Project</em>
          </MenuItem>
          {projects.map((project) => (
            <MenuItem key={project.id} value={project.id}>
              {project.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Deliverable"
        variant="outlined"
        fullWidth
        value={deliverable}
        onChange={(e) => setDeliverable(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" color="secondary" onClick={handleDeliverableSubmit}>
        Submit Deliverable
      </Button>
    </Box>
  );
};

export default StudentDashboard;
