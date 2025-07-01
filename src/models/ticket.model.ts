import mongoose, { ObjectId } from "mongoose";
const Schema = mongoose.Schema;
import { autoIncrement } from "mongoose-plugin-autoinc";

// 1 ticket = 1 seat
interface ITicket extends Document {
  bookingId: ObjectId;
  userId: ObjectId;
  showId: ObjectId;
  seat: ObjectId;
  ticketId: number;
  qrCodeUrl: string;
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
    required: true,
  },
  showId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Show",
    required: true,
  },
  seat: {
    type: String,
    required: true,
  },
  ticketId: {
    type: Number,
    required: true,
    unique: true,
  },
  qrCodeUrl: String,
});

ticketSchema.plugin(autoIncrement, {
  field: "ticketId",
  startAt: 100000,
  incrementBy: 1,
  modelName: "Ticket",
});

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
