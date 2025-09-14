import { Request, Response, NextFunction } from "express";
import { Hall } from "../models";
import AppError from "../utils/AppError";

export const checkHallOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const hall = await Hall.findById(req.params.hallId);

    if (!hall) {
      return next(new AppError("Hall not found", 404));
    }

    if (hall.ownerId.toString() !== req.user!._id) {
      return next(new AppError("You don't own this hall", 403));
    }

    // Optional: Attach the hall to the request for use in controllers
    req.hall = hall;

    next();
  } catch (error) {
    next(error);
  }
};
