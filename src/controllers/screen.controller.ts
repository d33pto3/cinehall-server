import { Request, Response } from "express";
import { Hall, Screen } from "../models";
import AppError from "../utils/AppError";

export const getScreens = async (_req: Request, res: Response) => {
  const screens = await Screen.find();

  res.status(200).json({
    success: true,
    message: "Fetch all screens",
    data: screens,
  });
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
  const { name, hallId, capacity } = req.body;

  if (!name || !hallId || !capacity) {
    throw new AppError("Give all the required information", 400);
  }

  const screen = new Screen({ name, hallId, capacity });

  res.json({ success: true, message: "Create new Screen", data: screen });
};
