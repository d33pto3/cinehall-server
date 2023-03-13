import express from "express";
const router = express.Router();

import {
  createBooking,
  getBookingById,
  getBookings,
} from "../controllers/bookingController.js";

// Booking routes
router.post("/", createBooking);
router.get("/:id", getBookingById);
router.get("/all", getBookings);

export default router;
