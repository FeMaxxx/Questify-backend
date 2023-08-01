import { HttpError } from "../helpers/index.js";
import { User } from "../models/user.js";
import tokenService from "../services/tokens.js";

export const authenticate = async (req, res, next) => {
  const { accessToken } = req.cookies;
  const { authorization = "" } = req.headers;
  const [bearer, t] = authorization.split(" ");
  let token = null;

  if (accessToken === "" && bearer !== "Bearer" && token === "") {
    next(HttpError(403));
  }

  if (accessToken !== undefined) {
    token = accessToken;
  } else {
    token = t;
  }

  try {
    const { id } = tokenService.validateAccessToken(token);
    const user = await User.findById(id);

    if (!user) next(HttpError(401));

    req.user = user;
    next();
  } catch {
    next(HttpError(401));
  }
};
