import mongoose, { Document, ObjectId } from "mongoose";
import { SeatStatus } from "../@types/enums";
const Scheam = mongoose.Schema;
interface ISeat extends Document {
  screenId: ObjectId;
  seatNumber: string;
  row: string;
  column: number;
  status?: SeatStatus;
  heldBy: ObjectId;
  isHeld: boolean;
  heldUntil: Date;
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
  status: {
    type: String,
    enum: SeatStatus,
    default: SeatStatus.AVAILABLE,
  },
  heldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  isHeld: {
    type: Boolean,
    default: false,
  },
  heldUntil: {
    type: Date,
    default: null,
  },
});

export const Seat = mongoose.model<ISeat>("Seat", seatSchema);
