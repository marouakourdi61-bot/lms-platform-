const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      status: 400,
      message: "Invalid JSON",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      status: 413,
      message: "File must not exceed 5 MB",
    });
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      status: 400,
      message: "Validation error",
      errors,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      status: 400,
      message: "Invalid ID",
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];

    let message = field ? `${field} already exists` : "Resource already exists";

    if (field === "email") {
      message = "Email already registered";
    }

    return res.status(409).json({
      status: 409,
      message,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: 401,
      message: "Token has expired",
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
    return res.status(401).json({
      status: 401,
      message: "Invalid token",
    });
  }

  const statusCode = err.statusCode || err.status;

  if (statusCode) {
    if (statusCode >= 500) {
      console.error(err);
    }

    return res.status(statusCode).json({
      status: statusCode,
      message: statusCode >= 500 ? "Internal server error" : err.message,
      ...(statusCode === 400 && Array.isArray(err.errors) ? { errors: err.errors } : {}),
    });
  }

  console.error(err);

  res.status(500).json({
    status: 500,
    message: "Internal server error",
  });
};

module.exports = errorHandler;
