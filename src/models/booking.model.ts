import mongoose, { ObjectId } from "mongoose";
import { PaymentStatus, PaymentMethod } from "../@types/enums";
import { IPayment as IPaymentDetails } from "./payment.model";
const Schema = mongoose.Schema;

export interface IBooking extends Document {
  userId?: ObjectId;
  guestId?: string;
  showId: ObjectId;
  screenId: ObjectId;
  movieId: ObjectId;
  paymentId: ObjectId;
  seats: ObjectId[];
  totalPrice: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  isCancelled: boolean;
  tran_id?: string;
  paymentDetials: IPaymentDetails;
  expiresAt: Date;
  _id?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
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
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
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
      enum: Object.values(PaymentStatus),
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    tran_id: String,
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

BookingSchema.pre("validate", function (next) {
  if (!this.userId && !this.guestId) {
    next(new Error("Either userId or guestId is required for booking"));
  } else {
    next();
  }
});

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
