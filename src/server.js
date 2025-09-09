// src/server.js
// University Search Portal - Main Server
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const universityRoutes = require('./routes/universities');
const { connectDatabase } = require('./config/database');
const { setupRateLimit } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
setupRateLimit(app);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', universityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'University Search Portal API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve main page for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 University Search Portal running on http://localhost:${PORT}`);
      logger.info('📚 Available endpoints:');
      logger.info('  GET  /api/health              - Health check');
      logger.info('  GET  /api/universities/search - Search universities');
      logger.info('  GET  /api/universities/:id    - University details');
      logger.info('  GET  /api/universities/suggest- Search suggestions');
      logger.info('  GET  /api/countries           - List of countries');
      logger.info('  GET  /api/cities              - List of cities');
      logger.info('  GET  /api/stats               - Statistics overview');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

module.exports = app;
