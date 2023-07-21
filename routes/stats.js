import express from "express";
import { ctrl } from "../controllers/stats.js";
import { validateBody } from "../middlewares/index.js";
import { schemas } from "../models/stat.js";

export const statsRouter = express.Router();

statsRouter.patch(
  "/randomVord",
  validateBody(schemas.updateRandomWordStatsSchema),
  ctrl.updateRandomWordStats
);
