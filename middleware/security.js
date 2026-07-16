// Security Middlewares for Node/Express Application

const rateLimitRegistry = {};

// 1. Sanitizer to prevent NoSQL query operator injection
function sanitizeNoSql(req, res, next) {
  const clean = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          clean(obj[key]);
          if (obj[key] && typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      }
    }
  };
  
  if (req.body) {
    clean(req.body);
    for (const key in req.body) {
      if (req.body[key] && typeof req.body[key] === 'object' && Object.keys(req.body[key]).length === 0) {
        delete req.body[key];
      }
    }
  }
  if (req.query) {
    clean(req.query);
    for (const key in req.query) {
      if (req.query[key] && typeof req.query[key] === 'object' && Object.keys(req.query[key]).length === 0) {
        delete req.query[key];
      }
    }
  }
  if (req.params) {
    clean(req.params);
    for (const key in req.params) {
      if (req.params[key] && typeof req.params[key] === 'object' && Object.keys(req.params[key]).length === 0) {
        delete req.params[key];
      }
    }
  }
  
  next();
}

// 2. Custom memory-based API rate limiter (prevents Brute Force and DDoS)
function apiRateLimiter(maxRequests, windowMs) {
  return (req, res, next) => {
    // Get client IP address
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!rateLimitRegistry[ip]) {
      rateLimitRegistry[ip] = [];
    }

    // Keep timestamps only within the current sliding window
    rateLimitRegistry[ip] = rateLimitRegistry[ip].filter(timestamp => now - timestamp < windowMs);

    if (rateLimitRegistry[ip].length >= maxRequests) {
      return res.status(429).json({ message: 'Too many requests from this IP. Please try again later.' });
    }

    rateLimitRegistry[ip].push(now);
    next();
  };
}

// 3. Custom secure HTTP response headers
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self'");
  next();
}

module.exports = {
  sanitizeNoSql,
  apiRateLimiter,
  securityHeaders
};
