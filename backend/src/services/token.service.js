const jwt = require("jsonwebtoken");

const { jwtExpiresIn, jwtSecret } = require("../config/env");
const AppError = require("../utils/appError");

function assertJwtSecret() {
  if (!jwtSecret) {
    throw new AppError(500, "JWT_SECRET is not configured.");
  }
}

function signAccessToken(user) {
  assertJwtSecret();

  return jwt.sign(
    {
      email: user.email,
    },
    jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: jwtExpiresIn,
      subject: user.id,
    },
  );
}

function verifyAccessToken(token) {
  assertJwtSecret();
  return jwt.verify(token, jwtSecret, {
    algorithms: ["HS256"],
  });
}

module.exports = {
  assertJwtSecret,
  signAccessToken,
  verifyAccessToken,
};
