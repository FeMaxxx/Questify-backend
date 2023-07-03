import { Schema, model } from "mongoose";
import { handleMongooseError } from "../helpers/index.js";
import Joi from "joi";

const emailRegexp =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<;>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      require: true,
      match: emailRegexp,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      minLength: 6,
    },
    wordsInDictionary: {
      type: Number,
      default: 0,
    },
    wordsInLearningProcess: {
      type: Number,
      default: 0,
    },
    totalWordCount: {
      type: Number,
      default: 0,
    },
    successfulWordConfirmation: {
      type: Number,
      default: 0,
    },
    failedWordConfirmation: {
      type: Number,
      default: 0,
    },
    successfulRandomWordConfirmation: {
      type: Number,
      default: 0,
    },
    failedRandomWordConfirmation: {
      type: Number,
      default: 0,
    },
    token: {
      type: String,
      default: "",
    },
  },
  { versionKey: false, timestamps: false }
);

userSchema.post("save", handleMongooseError);

const authSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const updateStats = Joi.object({
  successes: Joi.boolean().required(),
});

export const User = model("user", userSchema);

export const schemas = {
  authSchema,
  updateStats,
};
