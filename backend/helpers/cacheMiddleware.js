const { createClient } = require('redis');

// Initialize Redis Client
const client = createClient({
  url: process.env.REDIS_URL || undefined
});

client.on('error', (err) => console.error('Redis Client Error:', err.message));
client.on('connect', () => console.log('Connected to Redis Cache'));

let isRedisConnected = false;

// Attempt to connect immediately
(async () => {
  try {
    if (process.env.REDIS_URL) {
      await client.connect();
      isRedisConnected = true;
    } else {
      console.warn("⚠️ REDIS_URL not set in .env. Redis caching is disabled. Falling back to direct database queries.");
    }
  } catch (err) {
    console.error("❌ Failed to connect to Redis. Caching disabled.", err.message);
  }
})();

const cacheMiddleware = (duration = 300) => async (req, res, next) => {
  // Only cache GET requests and only if Redis is successfully connected
  if (req.method !== 'GET' || !isRedisConnected) {
    return next();
  }

  const key = req.originalUrl;

  try {
    const cachedResponse = await client.get(key);
    
    if (cachedResponse) {
      // Return cached response instantly
      return res.json(JSON.parse(cachedResponse));
    } else {
      // Intercept res.json to save it to cache before sending
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache success responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            // Save to redis with expiration (duration in seconds)
            client.setEx(key, duration, JSON.stringify(body)).catch(err => {
              console.error("Redis setEx error:", err.message);
            });
          } catch (e) {
            console.error("Redis save error:", e.message);
          }
        }
        originalJson(body);
      };
      next();
    }
  } catch (err) {
    console.error("Redis get error, bypassing cache:", err.message);
    next();
  }
};

module.exports = {
  cacheMiddleware,
  client // Export instance in case manual invalidation is needed
};
