const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For password hashing
const { createClient } = require('@supabase/supabase-js'); // Supabase client
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
require('dotenv').config(); // Charger les variables d'environnement


const { ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Supabase Configuration (Variables d'environnement)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ensure GridFS is using the native MongoDB driver from Mongoose
const mongoose = require('mongoose');
// Charger l'URI depuis .env
const MONGO_URI = process.env.MONGO_URI;

// Connectez MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const conn = mongoose.connection;
let bucket;

// Initialize GridFSBucket after the connection is open
conn.once('open', () => {
    bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
    console.log('GridFSBucket initialized');
});


app.post('/api/users', async (req, res) => {
    const { uid, email, role, name, password } = req.body;

    if (!uid || !email || !role || !password) {
        return res.status(400).json({ message: 'Missing required fields (uid, email, role, and password are required).' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user into Supabase
        const { data, error } = await supabase.from('users').insert([
            { uid, email, role, name, password: hashedPassword }
        ]);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ message: 'Error adding user to database.' });
        }

        res.status(201).json({ message: 'User added successfully.', userId: data[0].id });
    } catch (err) {
        console.error('Error hashing password:', err.message);
        res.status(500).json({ message: 'Error storing user data. Please try again.' });
    }
});

// 2. Public Endpoint to Get User by UID (without authentication)
app.get('/api/users/:uid', async (req, res) => {
    const uid = req.params.uid;

    try {
        // Fetch user from Supabase
        const { data, error } = await supabase.from('users').select('*').eq('uid', uid);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ message: 'Error fetching user data.' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(data[0]); // Return the first user found
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ message: 'Error fetching user data.' });
    }
});

// 3. Add a New Project (POST)
app.post('/api/projects', upload.single('file'), async (req, res) => {
    const { title, description, school, filiere, matiere, deadline, status, year, teacher_uid } = req.body;

    try {
        let fileId = null;

        if (req.file) {
            console.log('File received, starting upload to MongoDB...');

            fileId = await new Promise((resolve, reject) => {
                const uploadStream = bucket.openUploadStream(req.file.originalname, {
                    contentType: req.file.mimetype,
                });

                uploadStream.on('error', (err) => {
                    console.error('Error writing to GridFS:', err);
                    reject(new Error('File upload failed'));
                });

                uploadStream.on('finish', () => {
                    console.log('Upload complete. File ID:', uploadStream.id);
                    resolve(uploadStream.id.toString());
                });

                uploadStream.end(req.file.buffer);
            });

            // Check if fileId was successfully generated
            if (!fileId) {
                console.error('File upload did not return a valid file ID');
            } else {
                console.log('File ID generated:', fileId);
            }
        }

        // Save project data to Supabase
        const { data, error } = await supabase.from('projects').insert([{
            title,
            description,
            school,
            filiere,
            matiere,
            deadline,
            status,
            year,
            teacher_uid,
            fileId // Store the MongoDB file ID
        }]);

        if (error) {
            console.error('Error adding project:', error);
            return res.status(500).json({ message: 'Error adding project', error: error.message });
        }

        console.log('Project successfully added to Supabase:', data[0]);
        res.status(201).json({ project: data[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});



app.get('/api/files/:id', async (req, res) => {
  const fileId = req.params.id;

  try {
    // Validate the ObjectId
    if (!ObjectId.isValid(fileId)) {
      return res.status(400).send('Invalid file ID');
    }

    // Use 'new' to create an instance of ObjectId
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

    // Set headers for PDF
    downloadStream.on('file', (file) => {
      if (file.contentType === 'application/pdf') {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${file.filename}"`, // Inline to view in browser
        });
      } else {
        res.set({
          'Content-Type': file.contentType,
          'Content-Disposition': `attachment; filename="${file.filename}"`, // Attachment to force download
        });
      }
    });

    // Stream the file to the client
    downloadStream.pipe(res);

    // Handle errors
    downloadStream.on('error', (err) => {
      console.error('Error retrieving file:', err);
      res.status(404).send('File not found');
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

// 5. Get Projects by Teacher UID (GET)
app.get('/api/projects/teacher/:teacher_uid', async (req, res) => {
    const { teacher_uid } = req.params;

    try {
        const { data, error } = await supabase.from('projects').select('*').eq('teacher_uid', teacher_uid);

        if (error) {
            console.error('Error fetching teacher projects:', error);
            return res.status(500).json({ message: 'Failed to fetch teacher projects.' });
        }

        res.status(200).json(data); // Return projects for this teacher
    } catch (err) {
        console.error('Error fetching teacher projects:', err);
        res.status(500).json({ message: 'Failed to fetch teacher projects.' });
    }
});
// 4. Get Projects with Filters (using Supabase)
app.get('/api/projects', async (req, res) => {
    const { school, filiere, matiere, year } = req.query;

    try {
        // Construire une requête dynamique
        let query = supabase.from('projects').select('*');

        if (school) {
            query = query.eq('school', school);
        }
        if (filiere) {
            query = query.eq('filiere', filiere);
        }
        if (matiere) {
            query = query.eq('matiere', matiere);
        }
        if (year) {
            query = query.eq('year', year);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erreur lors de la récupération des projets :', error);
            return res.status(500).json({ message: 'Erreur de récupération des projets.', error: error.message });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur serveur :', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});
app.get('/api/users', async (req, res) => {
    const { role } = req.query;
  
    try {
      const { data, error } = await supabase
        .from('users')
        .select('uid, email, role')
        .eq('role', role);
  
      if (error) {
        return res.status(500).json({ message: 'Error fetching users', error });
      }
  
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: 'Unexpected server error', error: err.message });
    }
  });
  
app.get('/api/projects', async (req, res) => {
    const { startDate, endDate, teacherUid } = req.query;

    // Vérification des paramètres requis
    if (!teacherUid) {
        return res.status(400).json({ message: 'Teacher UID is required.' });
    }

    try {
        const { data, error } = await supabase
            .from('projects')
            .select('id, title, status, created_at, deadline, email, matiere, role, teacher_uid')
            .eq('role', 'student') // Filtrage par rôle "student"
            .eq('teacher_uid', teacherUid)
            .gte('created_at', startDate)
            .lte('deadline', endDate);

        if (error) {
            return res.status(500).json({ message: 'Error fetching projects', error });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: 'Unexpected server error', error: err.message });
    }
});

// 7. Update Project Status (PUT)
app.put('/api/projects/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating project ID: ${id} with status: ${status}`);

    // Vérifie si l'ID et le statut sont valides
    if (!id || !status) {
        console.error('ID or status missing');
        return res.status(400).json({ message: 'ID and status are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('projects')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ message: 'Error updating project status in Supabase.', error });
        }

        if (!data || data.length === 0) {
            console.warn('Project not found');
            return res.status(404).json({ message: 'Project not found.' });
        }

        console.log('Project updated successfully:', data);
        res.status(200).json({ message: 'Project status updated successfully.', project: data[0] });
    } catch (err) {
        console.error('Unexpected server error:', err);
        res.status(500).json({ message: 'Unexpected server error.', error: err.message });
    }
});



// 6. Update Profile Data (PUT)
app.put('/api/profile', async (req, res) => {
    const { uid, school, filiere, year, matiere } = req.body;

    if (!uid) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    if (!school || !filiere || !year || !matiere) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Update the user's profile in Supabase
        const { data, error } = await supabase
            .from('users')
            .update({ school, filiere, year, matiere, updated_at: new Date() })
            .eq('uid', uid)
            .select();

        if (error) {
            console.error('Error updating profile:', error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the updated profile
        res.status(200).json({
            message: 'Profile updated successfully',
            profile: data[0],
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;

    bucket.find({ filename }).toArray((err, files) => {
        if (err || !files || files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const readStream = bucket.openDownloadStreamByName(filename);
        res.set('Content-Type', files[0].contentType);
        readStream.pipe(res);
    });
});    
 // Add Deliverables API Endpoints

// POST: Add a new deliverable
app.post('/api/deliverables', async (req, res) => {
    const { project_id, title, description, file_id, deadline } = req.body;

    if (!project_id || !title || !deadline) {
        return res.status(400).json({ message: 'Missing required fields (project_id, title, and deadline are required).' });
    }

    try {
        // Insert deliverable into Supabase
        const { data, error } = await supabase.from('deliverables').insert([
            { project_id, title, description, file_id, deadline }
        ]);

        if (error) {
            console.error('Error adding deliverable:', error);
            return res.status(500).json({ message: 'Error adding deliverable.', error: error.message });
        }

        res.status(201).json({ message: 'Deliverable added successfully.', deliverable: data[0] });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ message: 'Server error while adding deliverable.' });
    }
});

// GET: Fetch deliverables by project ID
app.get('/api/deliverables/:project_id', async (req, res) => {
    const project_id = req.params.project_id;

    try {
        // Fetch deliverables from Supabase
        const { data, error } = await supabase.from('deliverables').select('*').eq('project_id', project_id);

        if (error) {
            console.error('Error fetching deliverables:', error);
            return res.status(500).json({ message: 'Error fetching deliverables.', error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ message: 'Server error while fetching deliverables.' });
    }
});

// DELETE: Remove a deliverable by ID
app.delete('/api/deliverables/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // Delete deliverable from Supabase
        const { data, error } = await supabase.from('deliverables').delete().eq('id', id);

        if (error) {
            console.error('Error deleting deliverable:', error);
            return res.status(500).json({ message: 'Error deleting deliverable.', error: error.message });
        }

        if (data.length === 0) {
            return res.status(404).json({ message: 'Deliverable not found.' });
        }

        res.json({ message: 'Deliverable deleted successfully.' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ message: 'Server error while deleting deliverable.' });
    }
});

  
  
// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
