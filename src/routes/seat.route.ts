import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  deleteSeat,
  getSeatsByScreenId,
  updateSeat,
  createSeatsByScreenId,
} from "../controllers/seat.controller";

const router = express.Router();

router
  .route("/:id")
  .put(asyncHandler(updateSeat))
  .delete(asyncHandler(deleteSeat));

router
  .route("/screen/:screenId")
  .get(asyncHandler(getSeatsByScreenId))
  .post(asyncHandler(createSeatsByScreenId));

export default router;
