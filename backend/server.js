const app = require("./src/app");
const connectDatabase = require("./src/config/database");
const { port } = require("./src/config/env");

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Habit Tracker API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error(`Unable to start Habit Tracker API: ${error.message}`);
  process.exit(1);
});
