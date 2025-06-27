// ShowtimeController
import { Request, Response } from "express";
import { Show } from "../models/show.model";
import AppError from "../utils/AppError";

// Get all showtimes for a specific movie and theater
export const getShows = async (req: Request, res: Response) => {
  const shows = await Show.find();

  res
    .status(200)
    .json({ success: true, message: "Fetch all shows", data: shows });
};

export const getShowById = async (req: Request, res: Response) => {
  const show = await Show.findById(req.params.id);

  if (!show) {
    throw new AppError("Show not found!", 404);
  }

  res.status(200).json({ success: "true", message: "Show fonud!", data: show });
};
