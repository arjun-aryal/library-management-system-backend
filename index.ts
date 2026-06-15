import cors from "cors";
import express from "express";
import { env } from "./src/config/env";
import mainRouter from "./src/routes/index.js";

const app = express();
const port = env.PORT || 5000;

app.use(express.json());

app.use(cors());
app.use("/api/v1", mainRouter);

const startServer = async () => {
  try {
    app.listen(port, () => {
      console.log(` Server running on port http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
