// Async Wrapper:
// A utility to handle errors in asynchronous routes without repetitive try-catch blocks

import { Request, Response, NextFunction } from "express";

// Wraps async route handlers and forwards errors to the error handler
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err) => next(err)); // Forward erros to errorHandler
  };

export default asyncHandler;

// Flow of the handler
// 1. Accepts an async fn as an arg
// 2. Wraps the async fn in a try-catch block
// 3. executes the passed fn
// a. if successful, it proceeds with the response logic
// b. if an error occurs, it forwards the error to the global error handler using next()
