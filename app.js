import express from "express";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter, wordsRouter } from "./routes/index.js";
import { authenticate } from "./middlewares/index.js";

dotenv.config();

export const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/words", authenticate, wordsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  res.status(status).json({ message: err.message });
});
