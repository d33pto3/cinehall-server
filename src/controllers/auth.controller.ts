import { Request, Response } from "express";
import { firebaseAdmin } from "../config/firebase";
import AppError from "../utils/AppError";
import { createToken } from "../utils";
import bcrypt from "bcrypt";
import { User } from "../models";
// import { randomBytes } from "crypto";
// import { sendEmail } from "../utils/emailService";

const COOKIE_EXPIRES_IN = 3 * 24 * 60 * 60 * 1000;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_EXPIRES_IN,
  sameSite: "strict" as const,
};

// Helper function to format user response
// const formatUserResponse = (user: any): IUserResponse => ({
//   _id: user._id,
//   email: user.email,
//   name: user.username || user.name || "Anonymous",
//   ...(user.role && { role: user.role }),
//   ...(user.phone && { phone: user.phone }),
// });

export const firebaseLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError("No ID token provided", 400);
  }

  // Verify the Firebase ID token
  const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  const { uid, email, name, picture } = decodedToken;

  const displayName =
    name.split(" ")[0] ||
    (email && email.split("@")[0] + Math.floor(Math.random() * 1000));

  // Check if the user already exists in the database
  let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

  if (!user) {
    // Create a new user if they don't exist
    user = new User({
      email,
      firebaseUid: uid,
      username: displayName, // Default name if not provided
      role: "user",
      avatar: picture || null,
    });
    await user.save();
  } else if (user.firebaseUid !== uid) {
    // Update existing user with Firebase UID if missing
    user.firebaseUid = uid;
    await user.save();
  }

  // Generate a JWT token for your backend
  const token = createToken(user._id, user.role);

  res.cookie("token", token, {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === "production", // Ensures the browser only sends the cookie over HTTPS in production
    maxAge: COOKIE_EXPIRES_IN, // Sets the cookie to expire in 1 day
    sameSite: "strict",
    // path: "/",
  });

  // Send the token and user information back to the client
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
    throw new AppError("Please provide email, password and name", 400);
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword,
    username,
    role: "user",
  });

  await user.save();
  const token = createToken(user._id, user.role);

  // Save the token in a cookie
  res.cookie("token", token, COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      name: user.username,
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

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password!);

  if (!isMatch) {
    throw new AppError("Invalid password", 401);
  }

  const token = createToken(user._id, user.role);

  // Save the token in a cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_EXPIRES_IN,
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      name: user.username,
      role: user.role,
    },
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.token;

  if (!token) {
    // User is already logged out
    throw new AppError("Already logged out", 400);
  }

  // Clear the token cookie
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// TODO
// export const sendEmailVerification = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   const user = await User.findById(req.user?._id);

//   if (!user) {
//     throw new AppError("User not found", 404);
//   }

//   if (user.isVerified) {
//     throw new AppError("Email already verified", 200);
//   }

//   // Generate verification token
//   const token = randomBytes(32).toString("hex");
//   user.emailVerificationToken = token;
//   await user.save();

//   const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

//   // Send email
//   await sendEmail(
//     user.email,
//     "Verify your email",
//     `
//     <p>Click the link below to verify your email:</p>
//     <a href="${verifyUrl}">${verifyUrl}</a>
//   `,
//   );

//   res.status(200).json({ message: "Verification email sent" });
// };
