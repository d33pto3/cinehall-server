import mongoose, { Document, ObjectId } from "mongoose";
const Scheam = mongoose.Schema;

interface ISeat extends Document {
  screenId: ObjectId;
  seatNumber: string;
  row: string;
  column: number;
}

const seatSchema = new Scheam<ISeat>({
  screenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Screen",
    required: true,
  },
  seatNumber: {
    type: String,
    required: true,
  },
  row: {
    type: String,
    required: true,
  },
  column: {
    type: Number,
    required: true,
  },
});

export const Seat = mongoose.model<ISeat>("Seat", seatSchema);
