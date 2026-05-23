const User = require("../models/user.model");
const {
  assertJwtSecret,
  signAccessToken,
} = require("../services/token.service");
const { clearAuthCookie, setAuthCookie } = require("../utils/authCookie");
const AppError = require("../utils/appError");

function validateCredentials(email, password) {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    throw new AppError(400, "Email and password are required.");
  }
}

async function signup(req, res) {
  const { name, email, password } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    throw new AppError(400, "Name is required.");
  }

  validateCredentials(email, password);
  assertJwtSecret();

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.exists({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError(409, "An account with that email already exists.");
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  setAuthCookie(res, signAccessToken(user));

  res.status(201).json({
    message: "Account created successfully.",
    user: user.toAuthJSON(),
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  validateCredentials(email, password);
  assertJwtSecret();

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    "+password",
  );
  const passwordMatches = user && (await user.comparePassword(password));

  if (!passwordMatches) {
    throw new AppError(401, "Email or password is incorrect.");
  }

  setAuthCookie(res, signAccessToken(user));

  res.json({
    message: "Logged in successfully.",
    user: user.toAuthJSON(),
  });
}

function logout(req, res) {
  clearAuthCookie(res);
  res.json({
    message: "Logged out successfully.",
  });
}

function getCurrentUser(req, res) {
  res.json({
    message: "Authenticated user loaded.",
    user: req.user.toAuthJSON(),
  });
}

module.exports = {
  getCurrentUser,
  login,
  logout,
  signup,
};
