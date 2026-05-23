function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route ${req.originalUrl} was not found.`,
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (!error.statusCode || error.statusCode >= 500) {
    console.error(error);
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Request validation failed.",
      errors: Object.values(error.errors).map((validationError) => ({
        field: validationError.path,
        message: validationError.message,
      })),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "An account with that email already exists.",
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Resource id is invalid.",
    });
  }

  return res.status(error.statusCode || 500).json({
    message:
      error.statusCode && error.statusCode < 500
        ? error.message
        : "Internal server error.",
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
