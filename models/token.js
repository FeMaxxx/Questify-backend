import { Schema, model } from "mongoose";
import { handleMongooseError } from "../helpers/index.js";

const tokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    refreshToken: { type: String, default: "" },
  },
  { versionKey: false, timestamps: false }
);

tokenSchema.post("save", handleMongooseError);

export const Token = model("token", tokenSchema);
