import { Request, Response } from "express";
import { Booking, Seat, Show, User } from "../models";
import mongoose from "mongoose";
import AppError from "../utils/AppError";

const ObjectId = mongoose.Types.ObjectId;

export const createTicket = async (req: Request, res: Response) => {
  const { bookingId, userId, showId, seatId } = req.body;

  const booking = await Booking.findById(bookingId);
  const user = await User.findById(userId);
  const show = await Show.findById(showId);
  const seat = await Seat.findById(seatId);

  if (!ObjectId.isValid(bookingId) || !booking) {
    throw new AppError("Provide valid Booking!", 400);
  }

  if (!ObjectId.isValid(userId) || !user) {
    throw new AppError("Provide valid User!", 400);
  }

  if (!ObjectId.isValid(showId) || !show) {
    throw new AppError("Provide valid Show!", 400);
  }

  if (!ObjectId.isValid(seatId) || !seat) {
    throw new AppError("Provide valid Seat!", 400);
  }

  res.status(201).json({});
};
