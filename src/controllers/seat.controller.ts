import { Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "../utils/AppError";
import { Screen, Seat } from "../models";
const ObjectId = mongoose.Types.ObjectId;

export const createSeatsByScreenId = async (req: Request, res: Response) => {
  const { seatNumber, row, column } = req.body;
  const screenId = req.params.screenId;

  if (!ObjectId.isValid(screenId)) {
    throw new AppError("Provide valid screen!", 400);
  }

  const screen = Screen.findById(screenId);

  if (!screen) {
    throw new AppError("Screen does not exist!", 400);
  }

  const newSeat = await Seat.create({
    screenId: screenId,
    seatNumber,
    row,
    column,
  });

  res
    .status(201)
    .json({ success: true, message: "New seat created", data: newSeat });
};

export const getSeatsByScreenId = async (req: Request, res: Response) => {
  const screenId = req.params.screenId;

  if (!ObjectId.isValid(screenId)) {
    throw new AppError("Provide valid Screen!", 400);
  }

  const screen = await Screen.findById(screenId);

  if (!screen) {
    throw new AppError("Screen is not found!", 404);
  }

  const seats = await Seat.find({ screenId });

  res.status(200).json({
    success: true,
    message: `Fetched seats successfully for Screen ${screen.name}`,
    count: seats.length,
    data: {
      seats,
      row: screen.rows,
      column: screen.columns,
    },
  });
};

export const updateSeat = async (req: Request, res: Response) => {
  const updatedSeat = await Seat.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updatedSeat) {
    throw new AppError("Seat not found!", 400);
  }

  res.status(200).json({
    success: true,
    message: "Seat updated!",
    data: updatedSeat,
  });
};

export const deleteSeat = async (req: Request, res: Response) => {
  const deletedSeat = await Seat.findByIdAndDelete(req.params.id);

  if (!deletedSeat) {
    throw new AppError("Seat not found!", 400);
  }

  res.status(200).json({
    success: true,
    message: "Seat deleted!",
    data: deletedSeat,
  });
};
