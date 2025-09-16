import mongoose from "mongoose";
import { Seat } from "../models/seat.model";

function getRowLabel(index: number): string {
  let label = "";
  while (index >= 0) {
    label = String.fromCharCode((index % 26) + 65) + label;
    index = Math.floor(index / 26) - 1;
  }
  return label;
}

export const generateSeats = async (
  showId: mongoose.Types.ObjectId,
  rows: number,
  columns: number,
) => {
  const seats = [];

  for (let i = 0; i < rows; i++) {
    const rowChar = getRowLabel(i);

    for (let j = 0; j < columns; j++) {
      seats.push({
        showId,
        seatNumber: `${rowChar}${j}`,
        row: rowChar,
        column: j,
      });
    }
  }

  await Seat.insertMany(seats);
};
