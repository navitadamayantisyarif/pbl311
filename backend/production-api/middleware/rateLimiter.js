'use strict';

// Simple in-memory rate limiter (for production, consider using Redis)
const rateLimitStore = new Map();

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limit options
 * @param {Number} options.windowMs - Time window in milliseconds
 * @param {Number} options.max - Maximum number of requests per window
 * @param {String} options.message - Error message when limit is exceeded
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // 100 requests per window default
    message = 'Too many requests, please try again later'
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean
      for (const [k, v] of rateLimitStore.entries()) {
        if (now - v.resetTime > windowMs) {
          rateLimitStore.delete(k);
        }
      }
    }

    const record = rateLimitStore.get(key);

    if (!record) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (now > record.resetTime) {
      // Reset the window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    record.count++;
    next();
  };
}

// Pre-configured rate limiters
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later'
});

const generalRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 100000, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later'
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  generalRateLimiter
};

