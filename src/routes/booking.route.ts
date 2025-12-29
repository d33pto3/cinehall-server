import express from "express";
const router = express.Router();

import {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  getBookingById,
  initiatePayment,
  getBookingsByUser,
} from "../controllers/booking.controller";
import asyncHandler from "../middlewares/asyncHandler";

// Booking routes
router
  .route("/")
  .get(asyncHandler(getBookings))
  .post(asyncHandler(createBooking));

router.get("/user/:userId", asyncHandler(getBookingsByUser));

router
  .route("/:id")
  .get(asyncHandler(getBookingById))
  .put(asyncHandler(updateBooking))
  .delete(asyncHandler(deleteBooking));

router.post("/initiate/:bookingId", asyncHandler(initiatePayment));

export default router;
