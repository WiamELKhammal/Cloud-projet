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

        // Insert the user into Supabase (Assuming you're using service_role for writing to DB)
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
        // Fetch user from Supabase using the anon key for public access
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

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
