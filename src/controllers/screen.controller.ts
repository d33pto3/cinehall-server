import { Request, Response } from "express";
import { Hall, Screen } from "../models";
import AppError from "../utils/AppError";
import { generateSeats } from "../utils/seatGenerator";

export const getScreens = async (_req: Request, res: Response) => {
  const screens = await Screen.find();

  res
    .status(200)
    .json({ success: true, message: "Fetch all screens", data: screens });
};

export const getScreenById = async (req: Request, res: Response) => {
  const screen = await Screen.findById(req.params.id);

  if (!screen) {
    throw new AppError("Screen not found", 404);
  }

  res
    .status(200)
    .json({ success: true, message: "Screen fonud!", data: screen });
};

export const getScreensByHall = async (req: Request, res: Response) => {
  const hallId = req.params.hallId;

  if (!hallId) {
    throw new AppError("Please provide the hall id!", 400);
  }

  const hall = await Hall.findById(hallId);

  if (!hall) {
    throw new AppError("Not found hall", 404);
  }

  const screens = await Screen.find({ hallId });

  res.status(200).json({
    success: true,
    message: `Fetched all screens for hall ${hall.name}`,
    data: screens,
  });
};

export const createScreen = async (req: Request, res: Response) => {
  const { name, hallId, rows, columns } = req.body;

  if (!name || !hallId || !rows || !columns) {
    throw new AppError("Give all the required information", 400);
  }

  const hall = await Hall.findById(hallId);

  if (!hall) {
    throw new AppError("Hall not found", 404);
  }

  // Optional: Only the owner of the hall or an admin can create screens
  // if (
  //   req.user.role !== "admin" &&
  //   hall.ownerId.toString() !== req.user.id
  // ) {
  //   return res.status(403).json({ message: "Forbidden: Not your hall" });
  // }

  const newScreen = await Screen.create({
    name,
    hallId,
    rows,
    columns,
    capacity: rows * columns,
  });

  generateSeats(newScreen._id, rows, columns);

  res.json({ success: true, message: "Create new Screen", data: newScreen });
};

export const updateScreen = async (req: Request, res: Response) => {
  const { name, hallId, capacity } = req.body;

  if (hallId) {
    const hall = await Hall.findById(hallId);

    if (!hall) {
      throw new AppError("Hall not found", 404);
    }
  }

  const updatedScreen = await Screen.findByIdAndUpdate(
    req.params.id,
    { name, hallId, capacity },
    { new: true },
  );

  if (!updatedScreen) {
    throw new AppError("Screen not found!", 404);
  }

  res
    .status(200)
    .json({ success: true, message: "Screen updated!", data: updateScreen });
};

export const deleteScreen = async (req: Request, res: Response) => {
  const deletedScreen = await Screen.findByIdAndDelete(req.params.id);

  if (!deletedScreen) {
    throw new AppError("Screen not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Screen deleted!",
    data: deletedScreen,
  });
};
