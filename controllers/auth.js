import { HttpError, ctrlWrapper } from "../helpers/index.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { Word } from "../models/word.js";
import dotenv from "dotenv";
dotenv.config();

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const newUser = await User.create({ ...req.body });
  const { _id } = newUser;
  const token = jwt.sign({ id: _id }, SECRET_KEY, { expiresIn: "5h" });

  await User.findByIdAndUpdate(_id, { token });
  await Word.create({
    _id,
    vocabulary: [],
    firstLvl: [],
    secondLvl: [],
    thirdLvl: [],
  });

  res.status(201).json({
    token: `Bearer ${token}`,
    user: {
      email,
    },
  });
};

const login = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "5h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token: `Bearer ${token}`,
    user: {
      email,
    },
  });
};

export const ctrl = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
};
