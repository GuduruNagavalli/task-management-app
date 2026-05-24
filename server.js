const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
app.locals.dbConnected = false;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) => {
  res.json({ dbConnected: app.locals.dbConnected });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  app.locals.dbConnected = await connectDB();
  if (!app.locals.dbConnected) {
    console.warn('Database unavailable. Running with temporary in-memory task storage.');
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT} and bound to 0.0.0.0`);
  });
};

startServer();
