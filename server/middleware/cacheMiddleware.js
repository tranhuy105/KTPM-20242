const cache = require("memory-cache");

/**
 * Caching middleware for GET requests
 * @param {number} duration - Cache duration in seconds
 * @returns {function} - Express middleware function
 */
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // tắt cache để dễ test
    next();

    // Only cache GET requests
    // if (req.method !== "GET") {
    //   return next();
    // }

    // // Create a cache key from the request URL
    // const key = `__express__${req.originalUrl || req.url}`;
    // const cachedBody = cache.get(key);

    // if (cachedBody) {
    //   // Return cached response
    //   res.send(JSON.parse(cachedBody));
    //   return;
    // } else {
    //   // Store the original send method
    //   const originalSend = res.send;

    //   // Override the send method to cache the response
    //   res.send = function (body) {
    //     // Don't cache error responses
    //     if (res.statusCode < 400) {
    //       cache.put(
    //         key,
    //         typeof body === "string" ? body : JSON.stringify(body),
    //         duration * 1000
    //       );
    //     }

    //     // Call the original send method
    //     originalSend.call(this, body);
    //   };

    //   next();
    // }
  };
};

/**
 * Clear cache for a specific pattern
 * @param {string} pattern - URL pattern to clear (e.g., '/api/v1/categories')
 */
const clearCache = (pattern) => {
  // Get all cache keys
  const keys = cache.keys();

  // Filter keys that match the pattern and delete them
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  });
};

module.exports = {
  cacheMiddleware,
  clearCache,
};
