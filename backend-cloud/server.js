const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For password hashing
const { createClient } = require('@supabase/supabase-js'); // Supabase client

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Supabase Configuration (Replace these with your actual values)
const SUPABASE_URL = 'https://kcezwoembsfctttahjgc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZXp3b2VtYnNmY3R0dGFoamdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NTEwMjksImV4cCI6MjA0ODEyNzAyOX0.wDAbB9KxgNd2zbRDGKomUC5yhnsRIs9qvc6znGlwn7Q'; // The anon key for public access

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- ROUTES ---
// 1. Register User (Sign Up)
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
app.post('/api/projects', async (req, res) => {
    const { title, description, school, filiere, matiere, deadline, status, year, teacher_uid } = req.body;

    try {
        const { data, error } = await supabase.from('projects').insert([
            {
                title,
                description,
                school,
                filiere,
                matiere,
                deadline,
                status,
                year,
                teacher_uid
            }
        ]);

        if (error) {
            console.error('Error adding project:', error);
            return res.status(500).json({ message: 'Error adding project' });
        }

        res.status(201).json({ project: data[0] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 4. Get All Projects (GET)
// 4. Get All Projects (GET)
app.get('/api/projects', async (req, res) => {
    const { teacher_uid, school, filiere, year } = req.query;

    console.log("Received query params:", req.query);  // Debugging query params

    try {
        let query = supabase.from('projects').select('*');

        // Add filters based on query parameters
        if (teacher_uid) query = query.eq('teacher_uid', teacher_uid);
        if (school) query = query.eq('school', school);
        if (filiere) query = query.eq('filiere', filiere);
        if (year) query = query.eq('year', year);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching projects:', error);
            return res.status(500).json({ message: 'Failed to fetch projects.' });
        }

        console.log("Fetched projects:", data);  // Debugging fetched projects

        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ message: 'Failed to fetch projects.' });
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

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
