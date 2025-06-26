import express from "express";
const router = express.Router();

import { createBooking, getBookings } from "../controllers/booking.controller";

// Booking routes
router.post("/", createBooking);
router.get("/all", getBookings);

export default router;
