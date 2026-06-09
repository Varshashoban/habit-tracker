const {
  authCookieName,
  jwtExpiresIn,
  nodeEnv,
} = require("../config/env");

const durationToMilliseconds = {
  d: 24 * 60 * 60 * 1000,
  h: 60 * 60 * 1000,
  m: 60 * 1000,
};

function getCookieMaxAge() {
  const match = /^(\d+)([dhm])$/.exec(jwtExpiresIn);

  if (!match) {
    return 7 * durationToMilliseconds.d;
  }

  return Number(match[1]) * durationToMilliseconds[match[2]];
}

function getAuthCookieOptions() {
  return {
    httpOnly: true,
    maxAge: getCookieMaxAge(),
    path: "/",
    sameSite: "none",
    secure: true,
  };
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, getAuthCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(authCookieName, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
  });
}

module.exports = {
  clearAuthCookie,
  getAuthCookieOptions,
  setAuthCookie,
};
