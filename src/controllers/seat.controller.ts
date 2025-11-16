import { Request, Response } from "express";
import mongoose from "mongoose";
import AppError from "../utils/AppError";
import { Seat, Show } from "../models";
import { SeatStatus } from "../@types/enums";
// import cron from "node-cron";

const ObjectId = mongoose.Types.ObjectId;

export const getSeatById = async (req: Request, res: Response) => {
  const seat = await Seat.findById(req.params.id);

  if (!seat) {
    throw new AppError("Not found Seat!", 404);
  }

  res.status(200).json({ success: "true", message: "Show fonud!", data: seat });
};

export const createSeatsByShowId = async (req: Request, res: Response) => {
  const { seatNumber, row, column } = req.body;
  const showId = req.params.showId;

  if (!ObjectId.isValid(showId)) {
    throw new AppError("Provide valid screen!", 400);
  }

  const screen = await Show.findById(showId);

  if (!screen) {
    throw new AppError("Show does not exist!", 400);
  }

  const newSeat = await Seat.create({
    showId,
    seatNumber,
    row,
    column,
  });

  res
    .status(201)
    .json({ success: true, message: "New seat created", data: newSeat });
};

export const getSeatsByShowId = async (req: Request, res: Response) => {
  const showId = req.params.showId;

  if (!ObjectId.isValid(showId)) {
    throw new AppError("Provide valid Screen!", 400);
  }

  const show = await Show.findById(showId);

  if (!show) {
    throw new AppError("Show is not found!", 404);
  }

  const seats = await Seat.find({ showId });

  res.status(200).json({
    success: true,
    message: `Fetched seats successfully for show ${show._id}`,
    count: seats.length,
    data: {
      seats,
      screen: show.screenId,
    },
  });
};

export const holdSeats = async (req: Request, res: Response) => {
  const { showId } = req.params;
  const { seatIds, userId } = req.body;

  console.log("hold", seatIds, userId);

  if (!ObjectId.isValid(showId)) {
    throw new AppError("Invalid Show!", 400);
  }

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    throw new AppError("Provide valid seat IDs!", 400);
  }

  if (!userId || typeof userId !== "string") {
    throw new AppError("User ID or Guest ID required!", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if seats are available OR expired holds OR already held by this user
    const seats = await Seat.find({
      _id: { $in: seatIds },
      showId,
      $or: [
        { status: SeatStatus.AVAILABLE, isHeld: false }, // Truly available
        { heldUntil: { $lt: new Date() } }, // Expired holds
        { heldBy: userId, isHeld: true }, // Already held by this user (re-holding)
      ],
    }).session(session);

    if (seats.length !== seatIds.length) {
      throw new AppError("Some seats are not available!", 400);
    }

    // Check if any seats are held by OTHER users
    const heldByOthers = seats.some(
      (seat) =>
        seat.isHeld &&
        seat.heldBy &&
        seat.heldBy.toString() !== userId &&
        seat.heldUntil &&
        new Date(seat.heldUntil) > new Date(),
    );

    if (heldByOthers) {
      throw new AppError("Some seats are currently held by other users!", 400);
    }

    const heldUntil = new Date(Date.now() + 5 * 60 * 1000);

    await Seat.updateMany(
      {
        _id: { $in: seatIds },
        showId,
      },
      {
        $set: {
          isHeld: true,
          heldBy: userId,
          heldUntil,
          // DON'T change status to BLOCKED - keep it AVAILABLE so holds can be released
          // Status only becomes BOOKED after payment confirmation
        },
      },
    ).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Seats held successfully!",
      data: { seatIds, heldUntil },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const releaseSeats = async (req: Request, res: Response) => {
  const { showId } = req.params;
  const { seatIds, userId } = req.body;

  console.log(seatIds, userId);

  if (!ObjectId.isValid(showId)) {
    throw new AppError("Invalid show ID!", 400);
  }

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    throw new AppError("Provide valid seat IDs!", 400);
  }

  if (!userId || typeof userId !== "string") {
    throw new AppError("User ID required!", 400);
  }

  // Only release if held by this user
  const result = await Seat.updateMany(
    {
      _id: { $in: seatIds },
      showId,
      heldBy: userId,
      isHeld: true,
    },
    {
      $set: {
        isHeld: false,
        heldBy: null,
        heldUntil: null,
        // Keep status as AVAILABLE (don't change it)
      },
    },
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} seat(s) released!`,
    data: {
      releasedCount: result.modifiedCount,
      requestedCount: seatIds.length,
    },
  });
};

// Book seats (confirm booking after payment)
export const bookSeats = async (req: Request, res: Response) => {
  const { showId } = req.params;
  const { seatIds, userId, bookingId } = req.body;

  if (!ObjectId.isValid(showId)) {
    throw new AppError("Invalid show ID!", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verify seats are held by this user
    const seats = await Seat.find({
      _id: { $in: seatIds },
      showId,
      heldBy: userId,
      isHeld: true,
      heldUntil: { $gte: new Date() }, // Not expired
    }).session(session);

    if (seats.length !== seatIds.length) {
      throw new AppError(
        "Some seats are not held by you or have expired!",
        400,
      );
    }

    // Mark as booked
    await Seat.updateMany(
      {
        _id: { $in: seatIds },
        showId,
      },
      {
        $set: {
          status: SeatStatus.BOOKED,
          isHeld: false,
          heldBy: null,
          heldUntil: null,
        },
      },
    ).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Seats booked successfully!",
      data: {
        seatIds,
        bookingId,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Admin: Update single seat
export const updateSeat = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid Seat!", 400);
  }

  const updatedSeat = await Seat.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedSeat) {
    throw new AppError("Seat not found!", 404);
  }

  res.status(200).json({
    success: true,
    message: "Seat updated!",
    data: updatedSeat,
  });
};

// Admin: Delete single seat
export const deleteSeat = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid Seat!", 400);
  }

  const deletedSeat = await Seat.findByIdAndDelete(id);

  if (!deletedSeat) {
    throw new AppError("Seat not found!", 404);
  }

  res.status(200).json({
    success: true,
    message: "Seat deleted!",
    data: deletedSeat,
  });
};

// Cleanup expired holds (run via cron job)
export const cleanupExpiredHolds = async () => {
  try {
    const result = await Seat.updateMany(
      {
        isHeld: true,
        status: { $ne: SeatStatus.BOOKED },
        heldUntil: { $lt: new Date() },
      },
      {
        $set: {
          isHeld: false,
          heldBy: null,
          heldUntil: null,
          status: SeatStatus.AVAILABLE,
        },
      },
    );

    console.log(`Released ${result.modifiedCount} expired seat holds`);
    return result.modifiedCount;
  } catch (error) {
    console.error("Error cleaning up expired holds:", error);
    throw error;
  }
};
