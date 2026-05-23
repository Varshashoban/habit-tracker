const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  authCookieName: process.env.AUTH_COOKIE_NAME || "habit_tracker_token",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtSecret: process.env.JWT_SECRET || "",
  mongoUri: (process.env.MONGO_URI || process.env.MONGODB_URI || "").trim(),
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
};
