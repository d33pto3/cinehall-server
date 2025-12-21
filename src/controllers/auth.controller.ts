import { Request, Response } from "express";
import { firebaseAdmin } from "../config/firebase";
import AppError from "../utils/AppError";
import { createToken } from "../utils";
import bcrypt from "bcrypt";
import { User } from "../models";
import jwt from "jsonwebtoken";

const COOKIE_EXPIRES_IN = 3 * 24 * 60 * 60 * 1000; // 3 days

// Common cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_EXPIRES_IN,
  sameSite:
    process.env.NODE_ENV === "production"
      ? ("none" as const)
      : ("lax" as const),
  // For cross-origin requests in production (mobile app), use sameSite: 'none' and secure: true
  ...(process.env.NODE_ENV === "production" && {
    domain: process.env.COOKIE_DOMAIN, // e.g., ".yourdomain.com"
  }),
});

export const getUser = async (req: Request, res: Response) => {
  const token = req.cookies["cinehall-token"];

  console.log("token", token);

  if (!token) {
    throw new AppError("Not authenticated", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await User.findById(decoded._id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Return consistent user object
  res.status(200).json({
    _id: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    phone: user?.phone,
    avatar: user?.avatar,
  });
};

export const firebaseLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError("No ID token provided", 400);
  }

  // Verify the Firebase ID token
  const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  const { uid, email, name, picture } = decodedToken;

  const displayName =
    name?.split(" ")[0] ||
    (email && email.split("@")[0] + Math.floor(Math.random() * 1000)) ||
    "User";

  // Check if the user already exists
  let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

  if (!user) {
    // Create a new user
    user = new User({
      email,
      firebaseUid: uid,
      username: displayName,
      role: "user",
      avatar: picture || null,
    });
    await user.save();
  } else if (user.firebaseUid !== uid) {
    // Update existing user with Firebase UID
    user.firebaseUid = uid;
    await user.save();
  }

  // Generate JWT token
  const token = createToken(user._id, user.role);

  // Set cookie
  res.cookie("cinehall-token", token, getCookieOptions());

  // Return user data
  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

export const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    throw new AppError("Please provide email, password and username", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User already exists with this email", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword,
    username,
    role: "user",
  });

  await user.save();

  // Generate token
  const token = createToken(user._id, user.role);

  // Set cookie
  res.cookie("cinehall-token", token, getCookieOptions());

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone,
    },
  });
};

export const emailPasswordLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401); // Don't reveal which is wrong
  }

  if (!user.password) {
    throw new AppError(
      "This account uses social login. Please login with Google",
      400,
    );
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate token
  const token = createToken(user._id, user.role);

  // Set cookie
  res.cookie("cinehall-token", token, getCookieOptions());

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user?.phone,
      avatar: user?.avatar,
    },
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // Clear the token cookie
  res.clearCookie("cinehall-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    ...(process.env.NODE_ENV === "production" && {
      domain: process.env.COOKIE_DOMAIN,
    }),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
