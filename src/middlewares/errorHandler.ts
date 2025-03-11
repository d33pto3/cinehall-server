// Global Error Handler:
// A middlware to catch and format all errors before sending them to the cilent

import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import AppError from "../utils/AppError";

const errorHandler: ErrorRequestHandler = (
  err:
    | AppError
    | mongoose.Error.ValidationError
    | mongoose.Error.CastError
    | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // Handle specific error types
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}.`;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode || 500;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log the error for debugging
  console.error("Error Details:", {
    message: err.message,
    stack: err.stack,
    statusCode,
    isOperational,
  });

  // Send the response
  res.status(statusCode).json({
    success: false, // Consistent with your existing code
    message,
    ...(isDevelopment && { stack: err.stack }), // Include stack trace only in development
    ...(isOperational && { isOperational }), // Include isOperational flag if applicable
  });
};

export default errorHandler;

// Flow
// 1. Receives errors from next() or route handlers.
// 2. Checks if the error is an AppError:
// a. If yes, it extracts message, statusCode, and details from the error and sends an appropriate response.
// b. If no, it sends a generic 500 response with an "Internal Server Error" message.
// 3.Logs errors for debugging.
