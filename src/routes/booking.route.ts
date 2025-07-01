import express from "express";
const router = express.Router();

import {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  getBookingById,
} from "../controllers/booking.controller";
import asyncHandler from "../middlewares/asyncHandler";

// Booking routes
router
  .route("/")
  .get(asyncHandler(getBookings))
  .post(asyncHandler(createBooking));

router
  .route("/:id")
  .get(asyncHandler(getBookingById))
  .put(asyncHandler(updateBooking))
  .delete(asyncHandler(deleteBooking));

export default router;
