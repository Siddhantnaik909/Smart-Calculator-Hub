/* =========================================
   SMART HUB SERVER (server.js)
========================================= */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./models/User');
const History = require('./models/History');

const app = express();

// --- RENDER FIX: DYNAMIC PORT ---
// Render automatically assigns a PORT. We must also bind to 0.0.0.0
const PORT = process.env.PORT || 10000; 
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
      console.error('❌ DB Connection Error:', err);
      process.exit(1); // Exit if DB fails so Render can attempt a restart
  });

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- API ROUTES ---

// Health Check (To verify the server is awake)
app.get('/api/health', (req, res) => res.json({ status: 'Server is running' }));

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET);
        res.status(201).json({ token, user: { name: user.name, email: user.email } });
    } catch (err) { res.status(500).json({ error: 'Email already exists' }); }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET);
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) { res.status(500).json({ error: 'Login failed' }); }
});

// Save History
app.post('/api/history', authenticateToken, async (req, res) => {
    try {
        const { tool, inputs, result, date } = req.body;
        const newEntry = await History.create({
            userId: req.user.id,
            tool, inputs, result, date
        });
        res.status(201).json(newEntry);
    } catch (err) { res.status(500).json({ error: 'Error saving history' }); }
});

// Get History
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const history = await History.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
        res.json(history);
    } catch (err) { res.status(500).json({ error: 'Error fetching history' }); }
});

// Clear History
app.delete('/api/history', authenticateToken, async (req, res) => {
    try {
        await History.deleteMany({ userId: req.user.id });
        res.json({ message: 'History cleared' });
    } catch (err) { res.status(500).json({ error: 'Error clearing history' }); }
});

// --- START SERVER ---
// IMPORTANT: Bind to '0.0.0.0' for Render/Cloud environments
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});