// import express from 'express';
import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  getShowById,
  getShows,
  updateShow,
  deleteShow,
  createShow,
} from "../controllers/show.controller";
const router = express.Router();

// Showtime routes
router.route("/").get(asyncHandler(getShows)).post(asyncHandler(createShow));

router
  .route("/:id")
  .get(asyncHandler(getShowById))
  .put(asyncHandler(updateShow))
  .delete(asyncHandler(deleteShow));

export default router;
