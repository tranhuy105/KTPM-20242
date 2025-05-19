const express = require("express");
const cors = require("cors");
const { json } = require("body-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import middleware
const {
    notFound,
    errorHandler,
} = require("./middleware/errorMiddleware");
const requestLogger = require("./middleware/requestLoggerMiddleware");

// Import configuration
const connectDB = require("./config/database");

// Import Logger
const Logger = require("./utils/logger");
const logger = Logger.getLogger("Server");

// Import routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const brandRoutes = require("./routes/brandRoutes");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Apply middleware
app.use(cors());
app.use(json());
app.use(requestLogger);

// // Configure rate limiting
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per window
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   message: { error: "Too many requests, please try again later." },
// });

// // Apply rate limiting to all API routes
// app.use("/api/v1", apiLimiter);

// Set up API routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/brands", brandRoutes);

// Helpful redirects for common misrouted paths
app.get("/products", (req, res) => {
    res.status(301).json({
        status: "redirect",
        message:
            "This endpoint has moved. Please use the API versioned endpoint.",
        redirectTo: "/api/v1/products",
        documentation: "/api/v1/docs",
    });
});

app.get("/categories", (req, res) => {
    res.status(301).json({
        status: "redirect",
        message:
            "This endpoint has moved. Please use the API versioned endpoint.",
        redirectTo: "/api/v1/categories",
        documentation: "/api/v1/docs",
    });
});

// Base route for API health check
app.get("/", (req, res) => {
    res.json({
        message: "Luxury Shop REST API",
        status: "Running",
        version: "1.0.0",
    });
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "up",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
    });
});

// Apply error handling middleware
app.use(notFound);
app.use(errorHandler);

// Server instance
let server;

// Start server
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();
        logger.info("Connected to MongoDB database");

        // Start Express server
        server = app.listen(PORT, () => {
            logger.info(
                `Server running at http://localhost:${PORT}`
            );
            logger.info(
                `REST API endpoint: http://localhost:${PORT}/api/v1/products`
            );
            logger.info(
                `REST API endpoint: http://localhost:${PORT}/api/v1/categories`
            );
            logger.info(
                `REST API endpoint: http://localhost:${PORT}/api/v1/users`
            );
            logger.info(
                `REST API endpoint: http://localhost:${PORT}/api/v1/orders`
            );
        });

        // Properly handle server shutdown
        setupGracefulShutdown(server);
    } catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
}

// Graceful shutdown function
function setupGracefulShutdown(server) {
    // Handle CTRL+C
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle nodemon restarts
    process.on("SIGUSR2", () =>
        gracefulShutdown("SIGUSR2")
    );

    // Handle termination signals
    process.on("SIGTERM", () =>
        gracefulShutdown("SIGTERM")
    );

    // Graceful shutdown function
    function gracefulShutdown(signal) {
        logger.info(
            `Received ${signal}. Shutting down gracefully...`
        );

        server.close(() => {
            logger.info("HTTP server closed");

            process.exit(0);
        });

        setTimeout(
            () => {
                logger.info(
                    "Forced shutdown after timeout"
                );
                process.exit(1);
            },
            process.env.NODE_ENV === "production"
                ? 10000
                : 3000
        );
    }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger.error("UNHANDLED REJECTION:", err);
    // Don't exit the process to allow for recovery
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    logger.error("UNCAUGHT EXCEPTION:", err);
    // Exit the process for uncaught exceptions as they can leave the app in an unpredictable state
    process.exit(1);
});

startServer().catch((err) =>
    logger.error("Error starting server:", err)
);

module.exports = app; // Export for testing
