import { Request, Response } from "express";
import { User } from "../models";
import AppError from "../utils/AppError";
import { Role } from "../models/user.model";

export const getUsers = async (req: Request, res: Response) => {
  const { role } = req.query;

  let query = {};

  if (role && Object.values(Role).includes(role as Role)) {
    query = { ...query, role };
  } else {
    throw new AppError("This role does not exist", 404);
  }

  const { dateFrom, dateTo } = req.query;

  if (dateFrom || dateTo) {
    (query as any).createdAt = {};
    if (dateFrom) (query as any).createdAt.$gte = new Date(dateFrom as string);
    if (dateTo) (query as any).createdAt.$lte = new Date(dateTo as string);
  }

  const users = await User.find(query).select(
    "-password -emailVerificationToken",
  );

  res.status(200).json({
    success: true,
    message: "Users fetched successfully!",
    data: users,
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
};

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

export const deleteUser = async (req: Request, res: Response) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);

  if (!deletedUser) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
};
