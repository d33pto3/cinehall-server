import { Request, Response } from "express";
import { Booking } from "../models";
import AppError from "../utils/AppError";
import { PaymentStatus } from "../types/enums";
import { generateQrCode } from "../utils/qrCodeGenerator";
import { Ticket } from "../models/ticket.model";

export const paymentSuccessHandler = async (req: Request, res: Response) => {
  const {
    val_id,
    tran_id,
    card_type,
    currency,
    tran_date,
    card_issuer,
    card_brand,
    card_issuer_country,
    card_issuer_country_code,
  } = req.body;

  console.log(tran_id);

  const booking = await Booking.findOne({ tran_id });

  if (!booking) {
    throw new AppError("Booking not found for this transaction!", 404);
  }

  // Update payment status and store details
  booking.paymentStatus = PaymentStatus.PAID;
  booking.paymentDetials = {
    val_id,
    card_type,
    currency,
    tran_date,
    card_issuer,
    card_brand,
    card_issuer_country,
    card_issuer_country_code,
  };

  await booking.save();

  for (const seatId of booking.seats) {
    const ticketData = {
      bookingId: booking._id,
      userId: booking.userId,
      showId: booking.showId,
      seatId,
    };

    const qrCode = await generateQrCode(
      booking._id.toString(),
      seatId.toString(),
      booking.showId.toString(),
      booking.userId.toString(),
    );

    const ticket = await Ticket.create({
      ...ticketData,
      qrCode,
    });

    console.log("---------ticket", ticket);
  }

  // Redirect to frontend
  res.redirect(
    `${process.env.CLIENT_ROOT}/paymentSuccessful?bookingId=${booking._id}`,
  );
};

export const paymentFailHandler = async (req: Request, res: Response) => {
  const { tran_id } = req.body;

  await Booking.findByIdAndUpdate(tran_id, {
    paymentStatus: "FAILED",
  });

  return res.redirect(`${process.env.CLIENT_ROOT}/paymentFailure`);
};

export const paymentCancelHandler = async (req: Request, res: Response) => {
  const { tran_id } = req.body;

  await Booking.findByIdAndUpdate(tran_id, {
    paymentStatus: "CANCELLED",
  });

  return res.redirect(`${process.env.CLIENT_ROOT}/paymentCancelled`);
};

export const paymentNotificationHandler = async (
  req: Request,
  res: Response,
) => {
  res.status(200).json({ body: req.body });
};
