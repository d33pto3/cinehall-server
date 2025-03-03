// BookingController
import { Request, Response } from "express";
import Booking from "../models/bookingModel";

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("movie");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).send(booking);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message });
  }
};

// Get all bookings
export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ error: err.message });
  }
};
