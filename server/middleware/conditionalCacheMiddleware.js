const crypto = require("crypto");

/**
 * Conditional cache middleware using ETags
 * This middleware adds ETag support for HTTP caching
 */
const conditionalCache = () => {
  return (req, res, next) => {
    // Save the original send method
    const originalSend = res.send;

    // Override the send method
    res.send = function (body) {
      // Only generate ETags for successful responses
      if (res.statusCode < 400) {
        // Generate ETag from response body
        const content = typeof body === "string" ? body : JSON.stringify(body);
        const etag = crypto
          .createHash("md5")
          .update(content)
          .digest("hex")
          .slice(0, 16);

        // Set ETag header
        res.setHeader("ETag", `"${etag}"`);

        // Check if client's version matches
        const clientEtag = req.headers["if-none-match"];
        if (clientEtag === `"${etag}"`) {
          // Resource has not changed, send 304 Not Modified
          res.status(304).end();
          return;
        }
      }

      // Call the original send method
      return originalSend.call(this, body);
    };

    next();
  };
};

module.exports = conditionalCache;
