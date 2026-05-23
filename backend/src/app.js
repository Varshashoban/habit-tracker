const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");

const { clientUrl } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const habitRoutes = require("./routes/habit.routes");
const healthRoutes = require("./routes/health.routes");
const {
  notFoundHandler,
  errorHandler,
} = require("./middleware/error.middleware");

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    credentials: true,
    origin: clientUrl,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Habit Tracker API is running.",
    health: "/api/v1/health",
  });
});

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/habits", habitRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
