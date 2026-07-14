require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { DEFAULT_PORT } = require("./constants/constants");

const PORT = process.env.PORT || DEFAULT_PORT;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();