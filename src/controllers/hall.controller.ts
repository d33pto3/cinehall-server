// HallController
import { Request, Response } from "express";
import Hall from "../models/hall.model";
import AppError from "../utils/AppError";

// Create a new Hall
export const createHall = async (req: Request, res: Response) => {
  const { name, address, capacity } = req.body;
  const hall = new Hall({ name, address, capacity });
  await hall.save();
  res
    .status(201)
    .json({ success: true, message: "Created new hall", data: hall });
};

export const getHalls = async (_req: Request, res: Response) => {
  const halls = await Hall.find();
  res.status(200).json(halls);
};

// Read a single Hall by id
export const getHallById = async (_req: Request, res: Response) => {
  const hall = await Hall.findOne();
  res.status(200).json(hall);
};

// Delete a Hall by id
export const deleteHall = async (req: Request, res: Response) => {
  const deletedHall = await Hall.findByIdAndDelete(req.params.id);

  if (!deletedHall) {
    throw new AppError("Hall not found", 404);
  }

  res.status(200).json({ success: true, message: "Hall deleted!" });
};

// update a Hall by id
export const updateHall = async (req: Request, res: Response) => {
  const updatedHall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updatedHall) {
    throw new AppError("Hall not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Hall updated successfully!",
    data: updatedHall,
  });
};
