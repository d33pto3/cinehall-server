// import express from 'express';
import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  getShowById,
  getShows,
  updateShow,
  deleteShow,
  createShow,
  getShowsForHallowner,
} from "../controllers/show.controller";
import restrictTo from "../middlewares/auth/authorize.middleware";
import { Role } from "../models/user.model";
import authMiddleware from "../middlewares/auth/authenticate.middleware";
const router = express.Router();

// Showtime routes
router.route("/").get(asyncHandler(getShows)).post(asyncHandler(createShow));

router
  .route("/hallowner")
  .get(
    authMiddleware,
    restrictTo(Role.HALLOWNER),
    asyncHandler(getShowsForHallowner),
  );

router
  .route("/hallowner/:id")
  .get(authMiddleware, restrictTo(Role.HALLOWNER), asyncHandler(getShowById))
  .put(authMiddleware, restrictTo(Role.HALLOWNER), asyncHandler(updateShow));

router
  .route("/:id")
  .get(asyncHandler(getShowById))
  .put(asyncHandler(updateShow))
  .delete(asyncHandler(deleteShow));

export default router;
