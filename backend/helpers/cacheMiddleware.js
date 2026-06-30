const NodeCache = require('node-cache');

// Standard TTL of 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

const cacheMiddleware = (duration) => (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Use the original URL as the cache key
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    // Return cached response instantly
    return res.json(cachedResponse);
  } else {
    // Intercept res.json to save it to cache before sending
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache success responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, duration || 300);
      }
      originalJson(body);
    };
    next();
  }
};

module.exports = {
  cacheMiddleware,
  cache // Export instance in case manual invalidation is needed
};
