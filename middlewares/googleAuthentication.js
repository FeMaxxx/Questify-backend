import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy } from "passport-google-oauth2";
import { nanoid } from "nanoid";
import { User } from "../models/user.js";

const { BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

const googleParams = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/api/v1/auth/google/callback`,
  passReqToCallback: true,
};

const googleCallback = async (req, accessToken, refreshToken, profile, done) => {
  try {
    const { email } = profile;
    const user = await User.findOne({ email });
    if (user) {
      return done(null, user);
    }

    const password = await bcrypt.hash(nanoid(), 10);
    const newUser = await User.create({ email, password });
    done(null, newUser);
  } catch (error) {
    done(error, false);
  }
};

const googleStrategy = new Strategy(googleParams, googleCallback);

passport.use("google", googleStrategy);

export default passport;
