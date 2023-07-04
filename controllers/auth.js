import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { HttpError, ctrlWrapper } from "../helpers/index.js";
import { User } from "../models/user.js";
import { Word } from "../models/word.js";
import dotenv from "dotenv";
dotenv.config();

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ ...req.body, password: hashPassword });
  const { _id } = newUser;
  const token = jwt.sign({ id: _id }, SECRET_KEY, { expiresIn: "10h" });

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
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "10h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token: `Bearer ${token}`,
    user: {
      email,
    },
  });
};

const getCurrent = async (req, res) => {
  res.json(req.user);
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.json({
    message: "Logout success",
  });
};

export const ctrl = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
};
