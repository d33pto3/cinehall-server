import { Request, Response } from "express";
// import { Booking, Seat, Show, User } from "../models";
import mongoose from "mongoose";
// import AppError from "../utils/AppError";
import { Ticket } from "../models/ticket.model";
import AppError from "../utils/AppError";
const ObjectId = mongoose.Types.ObjectId;

// const ObjectId = mongoose.Types.ObjectId;

// export const createTicketsForBooking = async (req: Request, res: Response) => {
//   const { bookingId, userId, showId, seatId } = req.body;

//   const booking = await Booking.findById(bookingId);

//   if (!ObjectId.isValid(bookingId) || !booking) {
//     throw new AppError("Provide valid Booking!", 400);
//   }

//   const user = await User.findById(userId);
//   const show = await Show.findById(showId);
//   const seat = await Seat.findById(seatId);

//   if (!ObjectId.isValid(userId) || !user) {
//     throw new AppError("Provide valid User!", 400);
//   }

//   if (!ObjectId.isValid(showId) || !show) {
//     throw new AppError("Provide valid Show!", 400);
//   }

//   if (!ObjectId.isValid(seatId) || !seat) {
//     throw new AppError("Provide valid Seat!", 400);
//   }

//   res.status(201).json({});
// };

export const getAllTickets = async (_req: Request, res: Response) => {
  const tickets = await Ticket.find();

  res.status(200).json({
    success: true,
    message: "Successfully fetched all tickets!",
    data: tickets,
  });
};

export const getTicket = async (req: Request, res: Response) => {
  if (!ObjectId.isValid(req.params.id)) {
    throw new AppError("Ticket ID is not valid", 400);
  }

  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Successfully fetched ticket!",
    data: ticket,
  });
};
