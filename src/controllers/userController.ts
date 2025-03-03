import { Request, Response } from "express";
import User from "../models/userModel.js";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.status(201).json(users);
  } catch (err) {
    if (err instanceof Error) res.status(404).json({ message: err.message });
  }
};
