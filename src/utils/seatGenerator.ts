import mongoose from "mongoose";
import { Seat } from "../models/seat.model";

export const generateSeats = async (
  screenId: mongoose.Types.ObjectId,
  rows: number,
  columns: number,
) => {
  const seats = [];

  for (let i = 0; i < rows; i++) {
    let rowChar = String.fromCharCode(65 + i);
    if (i > 26) {
      rowChar += String.fromCharCode(65 + i - 26);
    }

    for (let j = 0; j <= columns; j++) {
      seats.push({
        screenId,
        seatNumber: `${rowChar}${j}`,
        row: rowChar,
        column: j,
      });
    }
  }

  await Seat.insertMany(seats);
};
