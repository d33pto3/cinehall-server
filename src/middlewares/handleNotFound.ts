import { Request, Response } from "express";

export const handleNotFound = (req: Request, res: Response) => {
  res.status(404).json({
    message: `${req.method} at ${req.path} not found`,
    statusCode: 404,
  });
};
