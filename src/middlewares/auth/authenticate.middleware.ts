import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../models/user.model";
import AppError from "../../utils/AppError";

const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Get token from cookies
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError("User unauthorized", 401);
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      _id: string;
    };

    // 3. Fetch the user from database and attach to request
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // 4. Attach only necessary user properties to request
    req.user = {
      _id: user._id.toString(),
      role: user.role,
      email: user.email,
      // Add other properties you need in route handlers
    };

    next();
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expired", 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }
    console.error("Authentication error:", error);
    return next(new AppError("Authentication failed", 500));
  }
};

export default authMiddleware;
