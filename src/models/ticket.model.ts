import mongoose, { ObjectId } from "mongoose";
const Schema = mongoose.Schema;

interface ITicket extends Document {
  bookingId: ObjectId;
  userId: ObjectId;
  showId: ObjectId;
  seats: string[];
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
  seats: [
    {
      type: String,
      required: true,
    },
  ],
  ticketId: {
    type: Number,
  },
  qrCodeUrl: String,
});

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
