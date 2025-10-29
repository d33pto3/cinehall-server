import mongoose, { Document, ObjectId } from "mongoose";
import { SeatStatus } from "../@types/enums";
const Schema = mongoose.Schema;
interface ISeat extends Document {
  showId: ObjectId;
  seatNumber: string;
  row: string;
  column: number;
  status?: SeatStatus;
  isHeld: boolean;
  heldBy?: ObjectId | null;
  heldUntil?: Date | null;
}

const seatSchema = new Schema<ISeat>(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
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
      type: String,
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
  },
  {
    timestamps: true,
  },
);

// seatSchema.pre("save", function (next) {
//   if (!/^[A-Z]$/.test(this.row)) {
//     next(new Error("Row must be a single uppercase letter"));
//   }
//   next();
// });

// MongoDB will reject any insert/update where the combinations already exists
seatSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ showId: 1, status: 1 }); // For querying available seats
seatSchema.index({ heldUntil: 1 }); // For cleaning up expired holds

export const Seat = mongoose.model<ISeat>("Seat", seatSchema);
