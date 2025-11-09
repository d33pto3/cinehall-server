// BookingController
import { Request, Response } from "express";
import { Booking, Movie, Screen, Seat, Show, User } from "../models";
import AppError from "../utils/AppError";
import mongoose from "mongoose";
import { PaymentStatus } from "../@types/enums";
import { SslCommerzPayment } from "sslcommerz";
import { preaparePaymentData } from "../utils/preparePaymentData";

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
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await Seat.updateMany(
    { _id: { $in: seats } },
    { $set: { status: "blocked" } },
  );

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

export const initiatePayment = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found!", 404);
  }

  const user = await User.findById(booking.userId);

  if (!user) {
    throw new AppError("User not found!", 404);
  }

  const paymentData = preaparePaymentData(booking, user);

  const sslcommerz = new SslCommerzPayment(
    process.env.SSLC_STORE_ID,
    process.env.SSLC_STORE_PASSWORD,
    false,
  );

  const apiResponse = await sslcommerz.init(paymentData);

  if (apiResponse.data?.status === "FAILED") {
    console.log(apiResponse.data?.failedReason);
    throw new AppError("There was an error during payment", 400);
  }

  booking.tran_id = paymentData.tran_id;

  await booking.save();

  const GatewayPageURL = apiResponse.GatewayPageURL;

  res.status(200).json({
    success: true,
    message: "Redirect to payment gateway",
    url: GatewayPageURL,
  });
};

export const cleanupExpiredBookings = async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const expiredBookings = await Booking.find({
    paymentStatus: { $ne: PaymentStatus.PAID },
    createdAt: { $lt: fiveMinutesAgo },
  });

  if (!expiredBookings.length) return;

  console.log(`[CLEANUP] Found ${expiredBookings.length} expired bookings`);

  for (const booking of expiredBookings) {
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      { $set: { status: "available" } },
    );
    await Booking.findByIdAndDelete(booking._id);
  }

  console.log(`[CLEANUP] ${expiredBookings.length} bookings deleted.`);
};
