import express from "express";
import { ctrl } from "../controllers/words.js";
import { validateBody } from "../middlewares/index.js";
import { schemas } from "../models/word.js";

export const wordsRouter = express.Router();

wordsRouter.get("/", ctrl.getAll);

wordsRouter.get("/random", ctrl.getRandomVordFromVocabulary);

wordsRouter.post("/", validateBody(schemas.addSchema), ctrl.add);

wordsRouter.post("/move", validateBody(schemas.moveSchema), ctrl.moveWord);

wordsRouter.post("/delete", validateBody(schemas.deleteSchema), ctrl.deleteWord);
