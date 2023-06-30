import express from "express";
import { ctrl } from "../controllers/auth.js";
import { validateBody } from "../middlewares/index.js";
import { schemas } from "../models/user.js";

export const authRouter = express.Router();

authRouter.post("/register", validateBody(schemas.authSchema), ctrl.register);

authRouter.post("/login", validateBody(schemas.authSchema), ctrl.login);
