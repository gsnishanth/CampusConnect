require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = new Set([frontendUrl]);
if (process.env.NODE_ENV !== 'production') {
  try {
    const configuredFrontend = new URL(frontendUrl);
    if (['localhost', '127.0.0.1'].includes(configuredFrontend.hostname)) {
      for (const hostname of ['localhost', '127.0.0.1']) {
        allowedOrigins.add(`${configuredFrontend.protocol}//${hostname}:${configuredFrontend.port}`);
      }
    }
  } catch (error) {
    console.error(`Invalid FRONTEND_URL: ${error.message}`);
    process.exitCode = 1;
  }
}
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  return res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected ? 'CampusConnect API running' : 'Database unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

// Global error handler (must be last)
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exitCode = 1;
  });
