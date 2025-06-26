import { ObjectId } from "mongoose";
import { Role } from "../models/userModel";

// Define a minimal user type for request context
interface RequestUser {
  _id: ObjectId;
  role: Role;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
