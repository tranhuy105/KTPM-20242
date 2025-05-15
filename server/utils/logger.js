/**
 * Logger Class - Inspired by Spring Boot Logging
 * Provides formatted, level-based logging with timestamps and context information
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
};

const COLORS = {
  RESET: "\x1b[0m",
  RED: "\x1b[31m",
  YELLOW: "\x1b[33m",
  GREEN: "\x1b[32m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
};

class Logger {
  constructor(context) {
    this.context = context || "Application";
    this.logLevel = process.env.LOG_LEVEL
      ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()]
      : LOG_LEVELS.INFO;
  }

  formatLog(level, message, data) {
    const timestamp = new Date().toISOString();
    let formattedMessage = `${timestamp} ${level} [${this.context}] - ${message}`;

    if (data) {
      if (typeof data === "object") {
        // Don't log full object for sensitive data or huge objects
        const safeData = this._sanitizeData(data);
        formattedMessage += `\n${JSON.stringify(safeData, null, 2)}`;
      } else {
        formattedMessage += ` - ${data}`;
      }
    }

    return formattedMessage;
  }

  _sanitizeData(data) {
    // Create a shallow copy
    const safeData = { ...data };
    // Remove sensitive fields
    const sensitiveFields = ["password", "token", "credit_card", "secret"];

    sensitiveFields.forEach((field) => {
      if (field in safeData) {
        safeData[field] = "******";
      }
    });

    return safeData;
  }

  error(message, data) {
    if (this.logLevel >= LOG_LEVELS.ERROR) {
      console.error(
        COLORS.RED + this.formatLog("ERROR", message, data) + COLORS.RESET
      );
    }
  }

  warn(message, data) {
    if (this.logLevel >= LOG_LEVELS.WARN) {
      console.warn(
        COLORS.YELLOW + this.formatLog("WARN", message, data) + COLORS.RESET
      );
    }
  }

  info(message, data) {
    if (this.logLevel >= LOG_LEVELS.INFO) {
      console.info(
        COLORS.GREEN + this.formatLog("INFO", message, data) + COLORS.RESET
      );
    }
  }

  debug(message, data) {
    if (this.logLevel >= LOG_LEVELS.DEBUG) {
      console.debug(
        COLORS.BLUE + this.formatLog("DEBUG", message, data) + COLORS.RESET
      );
    }
  }

  trace(message, data) {
    if (this.logLevel >= LOG_LEVELS.TRACE) {
      console.log(
        COLORS.MAGENTA + this.formatLog("TRACE", message, data) + COLORS.RESET
      );
    }
  }

  // Create logger with specific context
  static getLogger(context) {
    return new Logger(context);
  }
}

module.exports = Logger;
