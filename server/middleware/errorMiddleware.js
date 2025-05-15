const { validationResult } = require("express-validator");
const Logger = require("../utils/logger");
const logger = Logger.getLogger("ErrorHandler");

/**
 * Error handling middleware
 */

// Error response structure
const createErrorResponse = (statusCode, message, type, details = null) => {
  return {
    status: "error",
    error: {
      code: statusCode,
      type: type,
      message: message,
      details: details,
    },
  };
};

// Not Found Error Handler
const notFound = (req, res, next) => {
  const error = new Error(`Resource not found`);
  error.statusCode = 404;
  error.type = "NOT_FOUND";
  error.details = { path: req.originalUrl };
  next(error);
};

// Validation error handler middleware
const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    logger.warn(`Validation error on ${req.originalUrl}`, formattedErrors);

    return res
      .status(400)
      .json(
        createErrorResponse(
          400,
          "Validation failed",
          "VALIDATION_ERROR",
          formattedErrors
        )
      );
  }
  next();
};

// General Error Handler
const errorHandler = (err, req, res, next) => {
  // Determine status code - ensure it's set correctly based on error
  let statusCode;

  if (err.statusCode) {
    // Use error's status code if available
    statusCode = err.statusCode;
  } else if (err.type === "NOT_FOUND") {
    // Ensure NOT_FOUND errors are 404
    statusCode = 404;
  } else if (res.statusCode !== 200) {
    // Use the response status code if already set
    statusCode = res.statusCode;
  } else {
    // Default to 500 for unknown errors
    statusCode = 500;
  }

  // Determine error type
  const errorType = err.type || mapErrorTypeFromStatus(statusCode);

  // Format error message
  const errorMessage = err.message || "An unexpected error occurred";

  // Set response status
  res.status(statusCode);

  // Log the error with appropriate level
  if (statusCode >= 500) {
    logger.error(`Error processing request: ${req.method} ${req.originalUrl}`, {
      statusCode,
      type: errorType,
      error: errorMessage,
      stack: err.stack,
    });
  } else {
    logger.warn(`Error processing request: ${req.method} ${req.originalUrl}`, {
      statusCode,
      type: errorType,
      error: errorMessage,
    });
  }

  // Send error response
  const errorResponse = createErrorResponse(
    statusCode,
    errorMessage,
    errorType,
    err.details || null
  );

  // Only include stack trace in development environment
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  res.json(errorResponse);
};

// Map HTTP status codes to error types
function mapErrorTypeFromStatus(statusCode) {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "UNPROCESSABLE_ENTITY";
    case 429:
      return "TOO_MANY_REQUESTS";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    case 502:
      return "BAD_GATEWAY";
    case 503:
      return "SERVICE_UNAVAILABLE";
    default:
      return "UNKNOWN_ERROR";
  }
}

module.exports = {
  notFound,
  errorHandler,
  validationErrorHandler,
};
