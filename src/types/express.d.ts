import { Role } from "../models/user.model";

// Define a minimal user type for request context
interface RequestUser {
  _id: string;
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
