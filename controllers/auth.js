import bcrypt from "bcryptjs";
import { HttpError, ctrlWrapper } from "../helpers/index.js";
import { User } from "../models/user.js";
import { Word } from "../models/word.js";
import { Stat } from "../models/stat.js";
import { sendEmail } from "../services/sendEmail.js";
import { nanoid } from "nanoid";
import tokenService from "../services/tokens.js";

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const verificationCode = nanoid();
  // const varifyEmail = {
  //   to: email,
  //   subject: "Verify email",
  //   html: `<a target="_blank" href="https://tsylepa.github.io/Yummy/verification/${verificationCode}" >Click verify email</a>`,
  // };
  const newUser = await User.create({ ...req.body, password: hashPassword, verificationCode });
  const { _id } = newUser;

  // await sendEmail(varifyEmail);'
  await Word.create({
    user: _id,
    vocabulary: [],
    firstLvl: [],
    secondLvl: [],
    thirdLvl: [],
  });
  await Stat.create({ user: _id });

  res.status(201).json({ message: "Verify your email to complete the registration" });
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
  // if (user.verifiedEmail) {
  //   throw HttpError(401, "Email is not verified");
  // }

  const tokens = tokenService.generateTokens({ id: user._id, email: user.email });
  await tokenService.saveToken(user._id, tokens.refreshToken);

  res.cookie("refreshToken", tokens.refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.json({
    ...tokens,
    user: {
      email,
    },
  });
};

const verifyEmail = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw HttpError(401, "User not found");
  }
  if (user.verifiedEmail) {
    throw HttpError(401, "Email has already been verified");
  }

  const tokens = tokenService.generateTokens({ id: user._id, email: user.email });

  await tokenService.saveToken(user._id, tokens.refreshToken);
  await User.findByIdAndUpdate(user._id, {
    verifiedEmail: true,
    verificationCode: "",
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.status(200).json({
    ...tokens,
    user: {
      email: user.email,
    },
  });
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw HttpError(403, "Token invalid");
  }

  const { id, email } = tokenService.validateRefreshToken(refreshToken);
  const tokenFromDb = await tokenService.findToken(refreshToken);
  if (!id || !email || !tokenFromDb) {
    throw HttpError(403, "Token invalid");
  }

  const tokens = tokenService.generateTokens({ id, email });
  await tokenService.saveToken(id, tokens.refreshToken);

  res.cookie("refreshToken", tokens.refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.status(200).json({
    ...tokens,
    user: {
      email,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email } = req.user;
  res.status(200).json({
    user: {
      email,
    },
  });
};

const logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  await tokenService.removeToken(refreshToken);
  res.clearCookie("refreshToken");

  res.json({
    message: "Logout success",
  });
};

export const ctrl = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  verifyEmail: ctrlWrapper(verifyEmail),
  refreshToken: ctrlWrapper(refreshToken),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
};
