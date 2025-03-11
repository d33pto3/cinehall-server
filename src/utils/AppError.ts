// Custom Error Class
// Allows us to define different types of erros with meaningful messages and status code

export default class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Manitains proper stack trace for where the error ocurred
    Error.captureStackTrace(this, this.constructor);
  }
}

// Flow of this class
// 1. Create an instance of AppError by passing message, statusCode, and optional details
// 2. The AppError object is throw whenever needed
// 3. The gloabl error handler catches the instance, extracts information, and returns a strucutred error response
