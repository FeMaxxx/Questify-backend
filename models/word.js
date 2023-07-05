import { Schema, model } from "mongoose";
import { handleMongooseError } from "../helpers/index.js";
import Joi from "joi";

const wordsSchem = {
  word: {
    type: String,
    require: true,
  },
  translate: {
    type: [String],
    require: true,
  },
  addedAt: {
    type: Date,
    require: true,
  },
  canByConfirmed: {
    type: String,
    require: true,
  },
};

const wordSchema = new Schema(
  {
    vocabulary: [
      {
        word: {
          type: String,
          require: true,
        },
        translate: {
          type: [String],
          require: true,
        },
        addedAt: {
          type: Date,
          require: true,
        },
      },
    ],
    firstLvl: [wordsSchem],
    secondLvl: [wordsSchem],
    thirdLvl: [wordsSchem],
  },
  { versionKey: false, timestamps: false }
);

wordSchema.post("save", handleMongooseError);

const wordsContainers = ["vocabulary", "firstLvl", "secondLvl", "thirdLvl"];

const addSchema = Joi.object({
  word: Joi.string().required(),
  translate: Joi.array().items(Joi.string()).required(),
  addedAt: Joi.date().required(),
  canByConfirmed: Joi.string().required(),
});

const moveSchema = Joi.object({
  id: Joi.string().required(),
  moveFrom: Joi.valid(...wordsContainers).required(),
  moveTo: Joi.valid(...wordsContainers).required(),
  canByConfirmed: Joi.string().required(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
  deleteFrom: Joi.valid(...wordsContainers).required(),
});

export const Word = model("word", wordSchema);

export const schemas = {
  addSchema,
  moveSchema,
  deleteSchema,
};
