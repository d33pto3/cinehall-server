import mongoose, { Document, ObjectId } from "mongoose";
import { SeatStatus } from "../@types/enums";
const Scheam = mongoose.Schema;
interface ISeat extends Document {
  showId: ObjectId;
  seatNumber: string;
  row: string;
  column: number;
  status?: SeatStatus;
  heldBy: ObjectId;
  isHeld: boolean;
  heldUntil: Date;
}

const seatSchema = new Scheam<ISeat>({
  showId: {
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

// MongoDB will reject any insert/update where the combinations already exists
seatSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

export const Seat = mongoose.model<ISeat>("Seat", seatSchema);
