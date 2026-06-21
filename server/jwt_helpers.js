const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("./jwt_db_access");
require("dotenv").config();

const signAccessToken = (userId, payload = {}) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "1h",
      issuer: "yashayah.cloud",
      audience: userId,
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
        return;
      }
      resolve(token);
    });
  });
};

const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: "1y",
      issuer: "yashayah.cloud",
      audience: userId,
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        // reject(err)
        reject(createError.InternalServerError());
      }

      const isSaved = client.saveJWT(userId, token, 365 * 24 * 60 * 60);

      if (!isSaved) {
        console.log("Refresh token was not saved in database!");
        reject(createError.InternalServerError());
        return;
      }

      resolve(token);
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  if (!req.headers["authorization"]) {
    console.warn("⚠️ verifyAccessToken → no Authorization header on", req.method, req.path);
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }

  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];

  if (!token) {
    console.warn("⚠️ verifyAccessToken → Bearer token missing on", req.method, req.path);
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }

  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const message = err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      console.warn("⚠️ verifyAccessToken → JWT error:", message, "on", req.method, req.path);
      return res.status(403).json({ status: false, message });
    }
    req.payload = payload;
    // The acting person (used for profile + team actions)
    req.actingUserId = payload.aud;
    // The agency whose data is operated on. Team members act on behalf of the
    // owner, so all existing controllers (which use req.user) keep working.
    req.user = payload.agencyOwnerId || payload.aud;
    req.role = payload.role || "owner";
    next();
  });
};

// Gate a route to specific roles. Use after verifyAccessToken.
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.role)) {
    console.warn(`⚠️ requireRole → role "${req.role}" blocked on ${req.method} ${req.path}`);
    return res.status(403).json({
      status: false,
      message: "You don't have permission to perform this action.",
    });
  }
  next();
};

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, payload) => {
        if (err) return reject(createError.Unauthorized());
        const userId = payload.aud;

        const isExisting = await client.getJWT(userId);

        console.log({ isExisting });

        if (isExisting === false) {
          console.log("Error occured while getting JWT!");
          reject(createError.InternalServerError());
          return;
        } else if (!isExisting) {
          reject(createError.Unauthorized()); // empty jwt
        } else {
          if (refreshToken === isExisting.refreshToken) return resolve(userId);
          reject(createError.Unauthorized());
        }
      }
    );
  });
};

const signForgotToken = (email) => {
  console.log({ email });
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.FORGOT_TOKEN_SECRET;
    const options = {
      expiresIn: "10m",
      issuer: "pickurpage.com",
      audience: email,
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
        return;
      }
      resolve(token);
    });
  });
};

const verifyForgotToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.FORGOT_TOKEN_SECRET, (err, payload) => {
      if (err) {
        reject(createError.InternalServerError(err.message));
        return;
      }
      resolve(payload.aud);
    });
  });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  signForgotToken,
  verifyForgotToken,
  verifyAccessToken,
  verifyRefreshToken,
  requireRole,
};
