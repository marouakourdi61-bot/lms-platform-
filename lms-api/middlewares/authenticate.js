const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const error = new Error("Authorization header missing");
      error.statusCode = 401;
      return next(error);
    }
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      const error = new Error("Invalid authorization header format");
      error.statusCode = 401;
      return next(error);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("jwt secret is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = authenticate;
