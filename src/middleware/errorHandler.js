// src/middleware/errorHandler.js
const { logger } = require('../utils/logger');

function errorHandler(error, req, res, next) {
  logger.error('Unhandled error:', error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(isDevelopment && { 
      error: error.message,
      stack: error.stack 
    })
  });
}

module.exports = {
  errorHandler
};
