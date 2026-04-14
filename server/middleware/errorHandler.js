import multer from "multer";

export function notFoundHandler(request, response) {
  response.status(404).json({
    message: `Route not found: ${request.method} ${request.originalUrl}`
  });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      response.status(400).json({
        message: "Payment receipt must be 5 MB or smaller."
      });
      return;
    }

    response.status(400).json({
      message: error.message || "Upload failed."
    });
    return;
  }

  if (error.code === 11000) {
    response.status(409).json({
      message: "An application already exists for this roll number and internship type."
    });
    return;
  }

  const statusCode = error.statusCode || 500;
  response.status(statusCode).json({
    message: error.message || "Internal server error."
  });
}
