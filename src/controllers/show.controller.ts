// ShowtimeController
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { Movie, Screen, Show } from "../models";
import { Slots } from "../models/show.model";

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
  const { movieId, screenId, slot, date, basePrice } = req.body;
  const slotKey = slot as keyof typeof Slots;

  // Validate Movie and Screen existence
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new AppError("Movie not found!", 404);
  }

  if (!Screen.findById(screenId)) {
    throw new AppError("Screen not found!", 404);
  }

  // Validate slot
  if (!Object.keys(Slots).includes(slot)) {
    throw new AppError("Invalid slot value", 400);
  }

  // Generate startTime based on date + slot
  const [hour, minutes] = Slots[slotKey].split(":").map(Number);
  const startTime = new Date(date);
  startTime.setUTCHours(hour, minutes, 0, 0);

  // Calculate endTime = startTime + duration
  const endTime = new Date(startTime.getTime() + movie.duration * 60000);

  // Check for overlapping shows on the same screen and date
  const overlappingShow = await Show.findOne({
    screenId,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  });

  if (overlappingShow) {
    throw new AppError(
      `Screen already has a show overlapping this time slot on ${date}`,
      400,
    );
  }

  const show = new Show({
    movieId,
    screenId,
    startTime,
    endTime,
    basePrice,
    slot,
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
