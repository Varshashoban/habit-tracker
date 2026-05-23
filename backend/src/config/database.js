const mongoose = require("mongoose");

const { mongoUri } = require("./env");

async function connectDatabase() {
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in backend/.env.");
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error(
      'MONGO_URI must start with "mongodb://" or "mongodb+srv://". Check backend/.env.',
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

module.exports = connectDatabase;
