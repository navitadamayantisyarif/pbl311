'use strict';

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg')
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const https = require('https');
const fs = require('fs');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalRateLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const doorRoutes = require('./routes/door');
const userRoutes = require('./routes/users');
const cameraRoutes = require('./routes/camera');
const analyticsRoutes = require('./routes/analytics');
const historyRoutes = require('./routes/history');
const notificationRoutes = require('./routes/notifications');

// Initialize Express app
const app = express();
let server;
const keyPath = process.env.SSL_KEY_PATH;
const certPath = process.env.SSL_CERT_PATH;
if (keyPath && certPath && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const credentials = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  server = https.createServer(credentials, app);
} else {
  server = http.createServer(app);
}

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
const dbConfig = (() => {
  if (process.env.DATABASE_URL) {
    const useSsl = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined
    };
  }
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'securedoor',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };
})();

const pool = new Pool(dbConfig);

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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.emit('door-status', {
    locked: true,
    battery_level: Math.floor(Math.random() * 100),
    last_update: new Date().toISOString(),
    camera_active: true
  });
});

setInterval(() => {
  io.emit('door-status', {
    locked: Math.random() > 0.5,
    battery_level: Math.floor(Math.random() * 100),
    last_update: new Date().toISOString(),
    camera_active: Math.random() > 0.3
  });
}, 30000);

server.listen(PORT, HOST, () => {
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

