import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import AppError from "./AppError";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new AppError("JWT secret is not defined", 500);
}

// create token function
export const createToken = (_id: Types.ObjectId, role: string): string => {
  return jwt.sign({ _id, role }, JWT_SECRET, { expiresIn: "3d" });
};
