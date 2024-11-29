import React, { useState, useEffect } from 'react';
import {
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

interface Project {
  id: string;
  title: string;
  school: string;
  filiere: string;
  matiere: string;
  year: string;
  deadline: string;
}

const StudentDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState({
    school: '',
    filiere: '',
    matiere: '',
    year: '',
  });
  const [deliverable, setDeliverable] = useState<File | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects');
      const data = await response.json();
      if (data) {
        setProjects(data);
        setFilteredProjects([]);
      } else {
        console.warn('Aucun projet trouvé.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets :', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleYearChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFilters({ ...filters, year: e.target.value as string });
  };

  const applyFilters = () => {
    const filtered = projects.filter((project) => {
      return (
        (!filters.school || project.school.includes(filters.school)) &&
        (!filters.filiere || project.filiere.includes(filters.filiere)) &&
        (!filters.matiere || project.matiere.includes(filters.matiere)) &&
        (!filters.year || project.year === filters.year)
      );
    });
    setFilteredProjects(filtered);
  };

  const handleUploadDeliverable = () => {
    if (selectedProjectId && deliverable) {
      console.log(`Livrable téléchargé pour le projet ${selectedProjectId}:`, deliverable);
      setDeliverable(null); // Réinitialise après l'envoi
    } else {
      console.log('Veuillez sélectionner un projet et un fichier.');
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Filter Projects
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <TextField
          label="School"
          name="school"
          value={filters.school}
          onChange={handleFilterChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Filiere"
          name="filiere"
          value={filters.filiere}
          onChange={handleFilterChange}
          variant="outlined"
          fullWidth
        />
        <TextField
          label="Matiere"
          name="matiere"
          value={filters.matiere}
          onChange={handleFilterChange}
          variant="outlined"
          fullWidth
        />
        <Select
          value={filters.year}
          label="Year"
          name="year"
          onChange={handleYearChange}
          variant="outlined"
          fullWidth
          inputProps={{ style: { textAlign: 'center' } }}
        >
          <MenuItem value="1st Year">1st Year</MenuItem>
          <MenuItem value="2nd Year">2nd Year</MenuItem>
          <MenuItem value="3rd Year">3rd Year</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={applyFilters}>
          Search
        </Button>
      </Box>

      {filteredProjects.length > 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            Filtered Projects
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>School</TableCell>
                  <TableCell>Filiere</TableCell>
                  <TableCell>Matiere</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Deadline</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>{project.school}</TableCell>
                    <TableCell>{project.filiere}</TableCell>
                    <TableCell>{project.matiere}</TableCell>
                    <TableCell>{project.year}</TableCell>
                    <TableCell>{project.deadline}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography variant="h6" gutterBottom>
          Aucun projet correspondant aux critères.
        </Typography>
      )}

      <Typography variant="h6" sx={{ marginTop: 4 }}>
        Upload Deliverable
      </Typography>
      <Box sx={{ marginTop: 2 }}>
        <input
          type="file"
          onChange={(e) =>
            setDeliverable(e.target.files ? e.target.files[0] : null)
          }
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUploadDeliverable}
          disabled={!selectedProjectId || !deliverable}
          sx={{ marginLeft: 2 }}
        >
          Upload
        </Button>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
