import { Schema, model } from "mongoose";
import { handleMongooseError } from "../helpers/index.js";
import Joi from "joi";

const emailRegexp =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<;>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema(
  {
    email: { type: String, require: true, match: emailRegexp, unique: true },
    password: { type: String, require: true, minLength: 8, maxLength: 40 },
    verificationCode: { type: String, default: "" },
    verifiedEmail: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: false }
);

userSchema.post("save", handleMongooseError);

const authSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(8).max(40).required(),
});

export const User = model("user", userSchema);

export const schemas = {
  authSchema,
};
