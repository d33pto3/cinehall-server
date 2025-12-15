import mongoose, { ObjectId } from "mongoose";
const Schema = mongoose.Schema;
import { autoIncrement } from "mongoose-plugin-autoinc";

// 1 ticket = 1 seat
interface ITicket extends Document {
  bookingId: ObjectId;
  userId: ObjectId;
  showId: ObjectId;
  seatId: ObjectId;
  ticketId: number;
  qrCode: string;
  guestId?: string;
}

const ticketSchema = new Schema<ITicket>({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  guestId: {
    type: String,
    required: false,
  },
  showId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Show",
    required: true,
  },
  seatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seat",
    required: true,
  },
  ticketId: {
    type: Number,
    required: true,
    unique: true,
  },
  qrCode: String,
});

ticketSchema.plugin(autoIncrement, {
  model: "Ticket",
  field: "ticketId",
  startAt: 100000,
  incrementBy: 1,
});

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
