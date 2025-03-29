import { User } from "../models/userModel"; // Adjust the path if necessary

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add the user property to the Request interface
    }
  }
}
