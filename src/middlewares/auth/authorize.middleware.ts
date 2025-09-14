import { Request, Response, NextFunction, RequestHandler } from "express";
import AppError from "../../utils/AppError";
import { Role } from "../../models/user.model";

const restrictTo = (...allowedRoles: Role[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Check if user exists (should be attached by authMiddleware)
    if (!req.user) {
      return next(
        new AppError(
          "You are not logged in! Please log in to get access.",
          401,
        ),
      );
    }

    // 2. Check if user's role is included in the allowed roles
    if (!allowedRoles.includes(req.user.role as Role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    // 3. If authorized, proceed to next middleware/controller
    next();
  };
};

export default restrictTo;

// USAGE

// -- Only hall owners can access
// router.get("/hall-owner-only", restrictTo(Role.HALLOWNER), (req, res) => {
//   res.send("Hello Hall Owner 🏠");
// });

// -- Multiple roles can access
// router.get("/admin-or-owner", restrictTo(Role.ADMIN, Role.HALLOWNER), (req, res) => {
//   res.send("Hello Admin or Hall Owner!");
// });
