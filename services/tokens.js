import { Token } from "../models/token.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } = process.env;

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: "10d" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: "10d" });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, ACCESS_SECRET_KEY);
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, REFRESH_SECRET_KEY);
      return userData;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await Token.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await Token.create({ user: userId, refreshToken });
    return token;
  }

  async removeToken(refreshToken) {
    const tokenData = await Token.deleteOne({ refreshToken });
    return tokenData;
  }

  async findToken(refreshToken) {
    const tokenData = await Token.findOne({ refreshToken });
    return tokenData;
  }
}

export default new TokenService();
