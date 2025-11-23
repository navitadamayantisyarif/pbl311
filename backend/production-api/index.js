'use strict';

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg')
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalRateLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const doorRoutes = require('./routes/door');
const userRoutes = require('./routes/users');
const cameraRoutes = require('./routes/camera');

// Initialize Express app
const app = express();

// Trust proxy (important for correct IP addresses behind reverse proxy)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
} else {
  app.use(morgan('dev'));
}

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Health check endpoint (server + DB)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    // Simple query untuk cek koneksi
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
    logger.error('Database health check failed:', err.message);
  }

  res.json({
    success: dbStatus === 'connected',
    server: 'running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Apply general rate limiting to all routes
app.use(generalRateLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/door', doorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/camera', cameraRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, () => {
  logger.info(`Server is running on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  shutdown('UNHANDLED_REJECTION');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;

