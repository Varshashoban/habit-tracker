const { nodeEnv } = require("../config/env");

function getHealth(req, res) {
  res.json({
    status: "ok",
    service: "habit-tracker-api",
    environment: nodeEnv,
  });
}

module.exports = {
  getHealth,
};
