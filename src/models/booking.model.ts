import mongoose, { ObjectId } from "mongoose";
import { paymentStatus, paymentMethod } from "../types/enums";
const Schema = mongoose.Schema;

interface IBooking extends Document {
  userId: ObjectId;
  showId: ObjectId;
  screenId: ObjectId;
  seats: ObjectId[];
  totalPrice: number;
  paymentStatus: paymentStatus;
  paymentMethod?: paymentMethod;
  isCancelled: boolean;
}

const BookingSchema = new Schema<IBooking>({
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
  screenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Show",
    required: true,
  },
  seats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: Object.values(paymentStatus),
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(paymentMethod),
  },
  isCancelled: {
    type: Boolean,
  },
});

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
