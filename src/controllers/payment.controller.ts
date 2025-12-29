import { Request, Response } from "express";
import { Booking, Payment, Seat } from "../models";
import AppError from "../utils/AppError";
import { PaymentStatus, SeatStatus, PaymentMethod } from "../@types/enums";
import { generateQrCode } from "../utils/qrCodeGenerator";
import { Ticket } from "../models/ticket.model";

import mongoose from "mongoose";
import { validatePayment } from "../utils/sslcommerz";

export const paymentSuccessHandler = async (req: Request, res: Response) => {
  const { val_id: queryValId, tran_id: queryTranId, bookingId } = req.query;
  const { val_id: bodyValId, tran_id: bodyTranId } = req.body;

  const val_id = (bodyValId || queryValId) as string;
  const tran_id = (bodyTranId || queryTranId) as string;

  console.log("Payment callback received:", { 
    val_id, 
    tran_id, 
    queryBookingId: bookingId,
    query: req.query,
    body: req.body 
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let booking;
    if (tran_id) {
      booking = await Booking.findOne({
        $or: [{ _id: tran_id }, { tran_id: tran_id }],
      }).session(session);
    }

    if (!booking && bookingId) {
      booking = await Booking.findById(bookingId).session(session);
    }

    if (!booking) {
      console.error("Booking not found with:", { tran_id, bookingId });
      throw new AppError("Booking not found for this transaction!", 404);
    }

    // Idempotency check: If already paid, just redirect
    if (booking.paymentStatus === PaymentStatus.PAID) {
      await session.commitTransaction();
      return res.redirect(
        `${process.env.CLIENT_ROOT}/paymentSuccessful?bookingId=${booking._id}`,
      );
    }

    // Validate payment with SSLCommerz
    const validationData = await validatePayment(val_id as string);

    // Validate amount (allow small floating point difference if needed, but strict is better)
    if (
      Number(validationData.amount) < booking.totalPrice ||
      validationData.currency !== "BDT" // Assuming booking is in BDT
    ) {
      throw new AppError("Payment amount or currency mismatch", 400);
    }

    // Create Payment Record (check for duplicates first to be safe)
    const existingPayment = await Payment.findOne({ val_id }).session(session);
    if (!existingPayment) {
      await Payment.create(
        [
          {
            userId: booking.userId, // Can be null if guest
            val_id,
            card_type: validationData.card_type,
            currency: validationData.currency,
            tran_date: validationData.tran_date,
            card_issuer: validationData.card_issuer,
            card_brand: validationData.card_brand,
            card_issuer_country: validationData.card_issuer_country,
            card_issuer_country_code: validationData.card_issuer_country_code,
          },
        ],
        { session },
      );
    }

    // Update booking status
    booking.paymentStatus = PaymentStatus.PAID;
    // Map card_type to PaymentMethod
    let paymentMethod = PaymentMethod.CARD;
    const cardTypeUpper = validationData.card_type.toUpperCase();
    if (cardTypeUpper.includes("BKASH")) {
      paymentMethod = PaymentMethod.BKASH;
    } else if (cardTypeUpper.includes("NAGAD")) {
      paymentMethod = PaymentMethod.NAGAD;
    }
    booking.paymentMethod = paymentMethod;
    await booking.save({ session });

    // Update Seat Status
    // Determine the holder (User ID or Guest ID)
    const heldBy = booking.userId ? booking.userId.toString() : booking.guestId;

    for (const seatId of booking.seats) {
      const seat = await Seat.findOne({
        _id: seatId,
        isHeld: true,
        heldBy: heldBy,
        heldUntil: { $gte: new Date() },
      }).session(session);

      if (!seat) {
        throw new AppError(
          `Seat ${seatId} is no longer held by you or has expired.`,
          400,
        );
      }

      seat.status = SeatStatus.BOOKED;
      seat.heldBy = null; // Optional: release hold ownership now that it's booked? 
                          // Or keep it? The prompt asked for "Correct seat ownership logic (heldBy)".
                          // Usually BOOKED seats imply ownership via Ticket/Booking. 
                          // Clearing heldBy cleans up the "temp hold" state.
      seat.heldUntil = null;
      seat.isHeld = false;
      await seat.save({ session });

      // Create Ticket
      const ticketData = {
        bookingId: booking._id,
        userId: booking.userId,
        guestId: booking.guestId,
        showId: booking.showId,
        seatId,
      };

      const qrCode = await generateQrCode(
        booking._id.toString(),
        seatId.toString(),
        booking.showId.toString(),
        booking.userId?.toString() || booking.guestId!, 
      );

      await Ticket.create(
        [
          {
            ...ticketData,
            qrCode,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();

    // Redirect to frontend
    res.redirect(
      `${process.env.CLIENT_ROOT}/paymentSuccessful?bookingId=${booking._id}`,
    );
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Payment Success Error:", error);
    const errorMessage = encodeURIComponent(
      error.message || "Payment processing failed",
    );
    res.redirect(`${process.env.CLIENT_ROOT}/paymentFailure?error=${errorMessage}`);
  } finally {
    session.endSession();
  }
};

export const paymentFailHandler = async (req: Request, res: Response) => {
  const { tran_id: bodyTran_id, bookingId: bodyBookingId } = req.body;
  const { tran_id: queryTran_id, bookingId: queryBookingId } = req.query;

  const tran_id = bodyTran_id || queryTran_id || bodyBookingId || queryBookingId;

  console.log("Payment fail callback:", { tran_id, body: req.body, query: req.query });

  if (tran_id) {
    await Booking.findOneAndUpdate(
      { $or: [{ _id: tran_id }, { tran_id: tran_id }] },
      { paymentStatus: PaymentStatus.FAILED }
    );
  }

  return res.redirect(`${process.env.CLIENT_ROOT}/paymentFailure?error=Payment failed. Please try again.`);
};

export const paymentCancelHandler = async (req: Request, res: Response) => {
  const { tran_id: bodyTran_id, bookingId: bodyBookingId } = req.body;
  const { tran_id: queryTran_id, bookingId: queryBookingId } = req.query;

  const tran_id = bodyTran_id || queryTran_id || bodyBookingId || queryBookingId;

  console.log("Payment cancel callback:", { tran_id, body: req.body, query: req.query });

  if (tran_id) {
    await Booking.findOneAndUpdate(
      { $or: [{ _id: tran_id }, { tran_id: tran_id }] },
      { paymentStatus: PaymentStatus.CANCELLED }
    );
  }

  return res.redirect(`${process.env.CLIENT_ROOT}/paymentFailure?error=Payment cancelled by user.`);
};

export const paymentNotificationHandler = async (
  req: Request,
  res: Response,
) => {
  res.status(200).json({ body: req.body });
};
