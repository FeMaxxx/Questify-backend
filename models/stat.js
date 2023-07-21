import { Schema, model } from "mongoose";
import { handleMongooseError } from "../helpers/index.js";
import Joi from "joi";

const statSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    wordsInVocabulary: { type: Number, default: 0 },
    wordsInLearningProcess: { type: Number, default: 0 },
    totalWordCount: { type: Number, default: 0 },
    successfulWordConfirmation: { type: Number, default: 0 },
    failedWordConfirmation: { type: Number, default: 0 },
    successfulRandomWordConfirmation: { type: Number, default: 0 },
    failedRandomWordConfirmation: { type: Number, default: 0 },
  },
  { versionKey: false, timestamps: false }
);

statSchema.post("save", handleMongooseError);

const updateRandomWordStatsSchema = Joi.object({
  successes: Joi.boolean().required(),
});

export const Stat = model("stat", statSchema);

export const schemas = {
  updateRandomWordStatsSchema,
};
