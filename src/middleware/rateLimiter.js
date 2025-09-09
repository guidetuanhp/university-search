// src/middleware/rateLimiter.js
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logger } = require('../utils/logger');

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900, // Per 15 minutes by default
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      status: 'error',
      message: 'Too many requests',
      retryAfter: secs
    });
  }
};

function setupRateLimit(app) {
  // Apply rate limiting to API routes only
  app.use('/api', rateLimiterMiddleware);
  logger.info('✓ Rate limiting configured');
}

module.exports = {
  setupRateLimit,
  rateLimiterMiddleware
};
