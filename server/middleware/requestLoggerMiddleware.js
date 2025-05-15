/**
 * Request Logger Middleware
 * Logs details about each incoming request
 */
const Logger = require("../utils/logger");
const logger = Logger.getLogger("RequestLogger");

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Log request start
  logger.info(`${method} ${originalUrl} - Request from ${ip}`);

  // Save original end function
  const originalEnd = res.end;

  // Override end function to log response
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Log response details with appropriate log level based on status code
    if (statusCode >= 500) {
      logger.error(
        `${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`
      );
    } else if (statusCode >= 400) {
      logger.warn(
        `${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`
      );
    } else {
      logger.info(
        `${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`
      );
    }

    // Call original end function
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = requestLogger;
