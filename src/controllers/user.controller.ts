import { Request, Response } from "express";
import { User } from "../models";
import AppError from "../utils/AppError";

export const getUsers = async (_req: Request, res: Response) => {
  const users = await User.find({});
  res.status(201).json({
    success: true,
    message: "User fetched successfully!",
    data: users,
  });
};

// export const getUserById = async (req: Request, res: Response) => {
//   const user = await User.findById(req.params.id);
// };

export const updateUser = async (req: Request, res: Response) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updatedUser) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
};
