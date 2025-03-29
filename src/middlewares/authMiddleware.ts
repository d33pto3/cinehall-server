// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { User, IUser } from "../models/userModel";

// interface AuthRequest extends Request {
//   user?: InstanceType<typeof User>; // This should match your global declaration
// }

// const authMiddleware: RequestHandler = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const token = req.cookies?.token;
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
//       id: string;
//     };

//     // Fetch the user from database and attach to request
//     const user = await User.findById(decoded.id);
//     if (!user) return res.status(401).json({ message: "User not found" });

//     req.user = user; // Now this matches your global type declaration
//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(403).json({ message: "Invalid token" });
//   }
// };

// export default authMiddleware;
