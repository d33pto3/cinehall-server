import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now(); // Record the start time

  res.on("finish", () => {
    // 'finish' event is emitted when the response is sent
    const duration = Date.now() - start;

    console.log(
      `${req.method} ${req.url} \x1b[1m${res.statusCode}\x1b[22m ${duration} ms`,
    );
  });

  next();
};
