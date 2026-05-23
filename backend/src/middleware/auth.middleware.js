const { authCookieName } = require("../config/env");
const User = require("../models/user.model");
const { verifyAccessToken } = require("../services/token.service");
const AppError = require("../utils/appError");

function getRequestToken(req) {
  const bearerHeader = req.get("authorization");

  if (bearerHeader && bearerHeader.startsWith("Bearer ")) {
    return bearerHeader.slice(7);
  }

  return req.cookies[authCookieName];
}

async function requireAuth(req, res, next) {
  try {
    const token = getRequestToken(req);

    if (!token) {
      throw new AppError(401, "Authentication is required.");
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError(401, "Authentication is no longer valid.");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError(401, "Authentication token is invalid or expired."));
    }

    return next(error);
  }
}

module.exports = {
  requireAuth,
};
