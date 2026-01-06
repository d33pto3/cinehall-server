import express from "express";
import {
  getAdminStats,
  getAdminChartData,
  getAdminRecentBookings,
  getHallOwnerStats,
  getHallOwnerChartData,
  getHallOwnerRecentBookings,
} from "../controllers/dashboard.controller";
import authenticate from "../middlewares/auth/authenticate.middleware";
import authorize from "../middlewares/auth/authorize.middleware";
import { Role } from "../models/user.model";

const router = express.Router();

router.get("/admin/stats", authenticate, authorize(Role.ADMIN), getAdminStats);
router.get(
  "/admin/chart",
  authenticate,
  authorize(Role.ADMIN),
  getAdminChartData,
);
router.get(
  "/admin/bookings",
  authenticate,
  authorize(Role.ADMIN),
  getAdminRecentBookings,
);

// Hall Owner Routes
router.get(
  "/hallowner/stats",
  authenticate,
  authorize(Role.HALLOWNER),
  getHallOwnerStats,
);
router.get(
  "/hallowner/chart",
  authenticate,
  authorize(Role.HALLOWNER),
  getHallOwnerChartData,
);
router.get(
  "/hallowner/bookings",
  authenticate,
  authorize(Role.HALLOWNER),
  getHallOwnerRecentBookings,
);

export default router;
