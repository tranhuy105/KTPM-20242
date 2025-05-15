const mongoose = require("mongoose");
const Logger = require("../utils/logger");
const logger = Logger.getLogger("Database");
/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://root:password@localhost:27017/ecommerce?authSource=admin"
    );

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
