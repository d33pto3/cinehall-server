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
