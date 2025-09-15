// ShowtimeController
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { Movie, Screen, Show } from "../models";

// Get all showtimes for a specific movie and theater
export const getShows = async (req: Request, res: Response) => {
  const shows = await Show.find()
    .populate("movieId", "title")
    .populate("screenId", "name");

  res
    .status(200)
    .json({ success: true, message: "Fetch all shows", data: shows });
};

export const getShowById = async (req: Request, res: Response) => {
  const show = await Show.findById(req.params.id);

  if (!show) {
    throw new AppError("Not found Show!", 404);
  }

  res.status(200).json({ success: "true", message: "Show fonud!", data: show });
};

export const createShow = async (req: Request, res: Response) => {
  const { movieId, screenId, basePrice, startTime, endTime } = req.body;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (!Movie.findById(movieId)) {
    throw new AppError("Not found Movie!", 404);
  }

  if (!Screen.findById(screenId)) {
    throw new AppError("Not found Hall!", 404);
  }

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError("Invalid start time or end time format", 400);
  }

  if (startTime > endTime) {
    throw new AppError("End time cannot be greter than Start time", 400);
  }

  const show = new Show({
    movieId,
    screenId,
    basePrice,
    startTime,
    endTime,
  });

  await show.save();

  res
    .status(201)
    .json({ success: true, message: "Create new Show!", data: show });
};

export const updateShow = async (req: Request, res: Response) => {
  const updatedShow = await Show.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updatedShow) {
    throw new AppError("Not found Show!", 404);
  }

  res.status(200).json({
    success: true,
    message: "Update Show!",
    data: updatedShow,
  });
};

export const deleteShow = async (req: Request, res: Response) => {
  const deletedShow = await Show.findByIdAndDelete(req.params.id);

  if (!deletedShow) {
    throw new AppError("Not found Show!", 404);
  }

  res
    .status(200)
    .json({ success: true, message: "Delete Show!", data: deletedShow });
};
