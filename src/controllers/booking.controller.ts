// BookingController
import { Request, Response } from "express";
import { Booking, Movie, Screen, Seat, Show, User } from "../models";
import AppError from "../utils/AppError";
import mongoose from "mongoose";
import { PaymentStatus } from "../types/enums";

const ObjectId = mongoose.Types.ObjectId;

export const getBookingById = async (req: Request, res: Response) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new AppError("Booking not found!", 404);
  }

  res.status(200).json(booking);
};

// Get all bookings
export const getBookings = async (req: Request, res: Response) => {
  const bookings = await Booking.find();
  res.json({
    success: true,
    message: "Bookings fetch successfully!",
    data: bookings,
  });
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  const { userId, showId, screenId, movieId, seats } = req.body;

  const user = await User.findById(userId);

  if (!ObjectId.isValid(userId) || !user) {
    throw new AppError("Provide valid User!", 400);
  }

  const show = await Show.findById(showId);

  if (!ObjectId.isValid(showId) || !show) {
    throw new AppError("Provide valid Show!", 400);
  }

  const screen = await Screen.findById(screenId);

  if (!ObjectId.isValid(screenId) || !screen) {
    throw new AppError("Provide valid Screen!", 400);
  }

  const movie = await Movie.findById(movieId);

  if (!ObjectId.isValid(movieId) || !movie) {
    throw new AppError("Provide valid User!", 400);
  }

  if (seats.length <= 0) {
    throw new AppError("No seats selected!", 400);
  }

  const seatDocs = await Seat.find({ _id: { $in: seats } });

  if (seatDocs.length !== seats.length) {
    throw new AppError(
      "One or more selected seats do not exist for this screen",
      400,
    );
  }

  const existingBookings = await Booking.find({
    showId,
    seats: { $in: seats },
  });

  if (existingBookings.length > 0) {
    throw new AppError("These seats are already booked", 400);
  }

  const totalPrice = show.basePrice * seatDocs.length;

  const newBooking = await Booking.create({
    userId,
    showId,
    screenId,
    movieId,
    seats,
    totalPrice,
    paymentStatus: PaymentStatus.PENDING,
  });

  console.log(newBooking);

  res.status(201).json({
    success: true,
    message: "New booking!",
    data: newBooking,
  });
};

export const updateBooking = async (req: Request, res: Response) => {
  res.json({});
};

export const deleteBooking = async (req: Request, res: Response) => {
  res.json({});
};
