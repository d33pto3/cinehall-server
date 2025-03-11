import { Request, Response } from "express";
import { firebaseAdmin } from "../config/firebase";
import { User } from "../models/userModel";
import AppError from "../utils/AppError";
import { createToken } from "../utils";
import bcrypt from "bcrypt";

export const firebaseLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError("No ID token provided", 400);
  }
  // Verify the Firebase ID token
  const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  const { uid, email, name } = decodedToken;

  // Check if the user already exists in the database
  let user = await User.findOne({ firebaseUid: uid });

  if (!user) {
    // Create a new user if they don't exist
    user = new User({
      email,
      firebaseUid: uid,
      name: name || "Anonymous", // Default name if not provided
    });
    await user.save();
  }

  // Generate a JWT token for your backend
  const token = createToken(user._id);

  // Send the token and user information back to the client
  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
  });
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword,
    name,
  });

  await user.save();

  const token = createToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
  });
};

export const emailPasswordLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password!);

  if (!isMatch) {
    throw new AppError("Invalid password", 401);
  }

  const token = createToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
  });
};
