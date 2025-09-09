// src/middleware/cache.js
const { logger } = require('../utils/logger');

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 300; // 5 minutes default

function cacheMiddleware(ttl = CACHE_TTL) {
  return (req, res, next) => {
    // Generate cache key from request
    const cacheKey = generateCacheKey(req);
    req.cacheKey = cacheKey;
    
    // Check if we have cached response
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < (ttl * 1000)) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return res.json(cached.data);
    }
    
    // Store original res.json
    const originalJson = res.json;
    
    // Override res.json to cache the response
    res.json = function(data) {
      // Cache successful responses only
      if (data && data.status === 'success') {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        logger.debug(`Cached: ${cacheKey}`);
        
        // Clean up old cache entries periodically
        if (cache.size % 100 === 0) {
          cleanupCache();
        }
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

function generateCacheKey(req) {
  const url = req.originalUrl || req.url;
  const method = req.method;
  return `${method}:${url}`;
}

function cleanupCache() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of cache.entries()) {
    if ((now - value.timestamp) > (CACHE_TTL * 2000)) { // Double TTL for cleanup
      cache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logger.debug(`Cleaned up ${cleaned} expired cache entries`);
  }
}

function clearCache() {
  cache.clear();
  logger.info('Cache cleared');
}

module.exports = {
  cacheMiddleware,
  clearCache
};
