import { HttpError } from "../helpers/index.js";
import { User } from "../models/user.js";
import tokenService from "../services/tokens.js";

export const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, t] = authorization.split(" ");
  if (bearer !== "Bearer" || t === "") next(HttpError(403));

  try {
    const { id } = tokenService.validateAccessToken(t);
    const user = await User.findById(id);

    if (!user) {
      next(HttpError(401));
    }

    req.user = user;
    next();
  } catch {
    next(HttpError(401));
  }
};
