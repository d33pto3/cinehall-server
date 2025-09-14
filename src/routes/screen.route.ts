import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  createScreen,
  getScreens,
  getScreensByHall,
  updateScreen,
  deleteScreen,
  getScreenById,
  addScreenToHall,
  getScreensForHallowner,
} from "../controllers/screen.controller";
import authMiddleware from "../middlewares/auth/authenticate.middleware";
import restrictTo from "../middlewares/auth/authorize.middleware";
import { Role } from "../models/user.model";
import { checkHallOwnership } from "../middlewares/ownership.midldeware";
const router = express.Router();

// Screen routes

router
  .route("/")
  .get(asyncHandler(getScreens))
  .post(asyncHandler(createScreen));

router
  .route("/hallowner")
  .get(
    authMiddleware,
    restrictTo(Role.HALLOWNER),
    asyncHandler(getScreensForHallowner),
  );

router
  .route("/hallowner/:id")
  .get(authMiddleware, restrictTo(Role.HALLOWNER), asyncHandler(getScreenById))
  .post(authMiddleware, restrictTo(Role.HALLOWNER), asyncHandler(updateScreen))
  .delete(
    authMiddleware,
    restrictTo(Role.HALLOWNER),
    asyncHandler(deleteScreen),
  );

router
  .route("/:id")
  .get(asyncHandler(getScreenById))
  .put(asyncHandler(updateScreen))
  .delete(asyncHandler(deleteScreen));

router
  .route("/hall/:hallId")
  .get(asyncHandler(getScreensByHall))
  .post(
    authMiddleware,
    restrictTo(Role.HALLOWNER),
    checkHallOwnership,
    asyncHandler(addScreenToHall),
  );

export default router;
