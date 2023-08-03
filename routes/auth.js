import express from "express";
import { ctrl } from "../controllers/auth.js";
import { authenticate, validateBody, passport } from "../middlewares/index.js";
import { schemas } from "../models/user.js";

export const authRouter = express.Router();

authRouter.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }));

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  ctrl.googleAuth
);

authRouter.post("/register", validateBody(schemas.authSchema), ctrl.register);

authRouter.post("/login", validateBody(schemas.authSchema), ctrl.login);

authRouter.post("/verifyEmail/:verifyCode", ctrl.verifyEmail);

authRouter.post("/refresh", ctrl.refreshToken);

authRouter.get("/current", authenticate, ctrl.getCurrent);

authRouter.post("/logout", authenticate, ctrl.logout);
