const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const resetDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce",
    );
    console.log("MongoDB Connected for reset");

    // Drop the entire database
    await mongoose.connection.db.dropDatabase();
    console.log("Database dropped successfully");

    // Close connection
    await mongoose.connection.close();
    console.log("Database reset completed");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };
