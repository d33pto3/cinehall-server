// BookingController
import { Request, Response } from "express";
import { Booking, Movie, Screen, Seat, Show, User } from "../models";
import AppError from "../utils/AppError";
import mongoose from "mongoose";
import { PaymentStatus, SeatStatus } from "../@types/enums";
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
  const { userId, guestId, showId, screenId, movieId, seats } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const heldUntil = new Date(Date.now() + 5 * 60 * 1000);

    if (userId && !ObjectId.isValid(userId)) {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new AppError("Provide valid User!", 400);
      }
    }

    const show = await Show.findById(showId).session(session);

    if (!ObjectId.isValid(showId) || !show) {
      throw new AppError("Provide valid Show!", 400);
    }

    const screen = await Screen.findById(screenId).session(session);

    if (!ObjectId.isValid(screenId) || !screen) {
      throw new AppError("Provide valid Screen!", 400);
    }

    const movie = await Movie.findById(movieId).session(session);

    if (!ObjectId.isValid(movieId) || !movie) {
      throw new AppError("Provide valid Movie!", 400);
    }

    if (seats.length <= 0) {
      throw new AppError("No seats selected!", 400);
    }

    // Lock seats to prevent concurrent modification
    const seatDocs = await Seat.find({ _id: { $in: seats } }).session(session);

    if (seatDocs.length !== seats.length) {
      throw new AppError(
        "One or more selected seats do not exist for this screen",
        400,
      );
    }

    // Check availability inside the transaction
    const unavailableSeats = seatDocs.filter((seat) => {
      // 1. Check if already booked
      if (seat.status === SeatStatus.BOOKED) return true;

      // 2. Check strict hold ownership
      if (seat.isHeld && seat.heldUntil && seat.heldUntil > new Date()) {
        const heldBy = seat.heldBy ? seat.heldBy.toString() : null;
        const currentUserId = userId ? userId.toString() : null;
        const currentGuestId = guestId ? guestId.toString() : null;

        // Allow if held by current User OR current Guest
        // Note: We assume "heldBy" stores the ID string (User ID or Guest ID)
        if (heldBy === currentUserId || heldBy === currentGuestId) {
          return false; // Available for THIS user
        }

        return true; // Held by someone else
      }

      return false; // Not held or expired
    });

    if (unavailableSeats.length > 0) {
      throw new AppError(
        "One or more seats are already booked or held by another user",
        400,
      );
    }

    const existingBookings = await Booking.find({
      showId,
      seats: { $in: seats },
      isCancelled: false, // Don't count cancelled bookings? Or should we relying purely on seat status?
      // Existing logic relied on this check, but seat status is source of truth.
      // Keeping it butscoped to session
    }).session(session);

    if (existingBookings.length > 0) {
      // Double check active bookings
       const activeBookings = existingBookings.filter(b => b.paymentStatus !== PaymentStatus.FAILED && !b.isCancelled);
       if(activeBookings.length > 0) {
          throw new AppError("These seats are already booked (booking check)", 400);
       }
    }

    const totalPrice = show.basePrice * seatDocs.length;

    const newBooking = await Booking.create(
      [
        {
          userId,
          showId,
          screenId,
          guestId,
          movieId,
          seats,
          totalPrice,
          paymentStatus: PaymentStatus.PENDING,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      ],
      { session },
    );

    await Seat.updateMany(
      { _id: { $in: seats } },
      {
        $set: {
          isHeld: true,
          heldBy: userId || guestId,
          heldUntil,
          status: SeatStatus.BLOCKED,
        },
      },
      { session },
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "New booking created!",
      data: newBooking[0],
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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

  if (booking.paymentStatus === PaymentStatus.PAID) {
     throw new AppError("Booking is already paid!", 400);
  }

  let user = null;
  if (booking.userId) {
    user = await User.findById(booking.userId);
    if (!user) {
      throw new AppError("User not found!", 404);
    }
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
  const expiredBookings = await Booking.find({
    paymentStatus: { $ne: PaymentStatus.PAID },
    expiresAt: { $lt: new Date() },
  });

  if (!expiredBookings.length) return;

  console.log(`[CLEANUP] Found ${expiredBookings.length} expired bookings`);

  for (const booking of expiredBookings) {
    await Seat.updateMany(
      { _id: { $in: booking.seats } },
      {
        $set: {
          status: SeatStatus.AVAILABLE,
          isHeld: false,
          heldBy: null,
          heldUntil: null,
        },
      },
    );
    await Booking.findByIdAndDelete(booking._id);
  }

  console.log(`[CLEANUP] ${expiredBookings.length} bookings deleted.`);
};
