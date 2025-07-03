import mongoose, { ObjectId } from "mongoose";
import { PaymentStatus, PaymentMethod } from "../types/enums";
const Schema = mongoose.Schema;

interface IPaymentDetails {
  val_id: string;
  card_type: string;
  currency: string;
  tran_date: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
}
export interface IBooking extends Document {
  userId: ObjectId;
  showId: ObjectId;
  screenId: ObjectId;
  movieId: ObjectId;
  seats: ObjectId[];
  totalPrice: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  isCancelled: boolean;
  tran_id?: string;
  paymentDetials: IPaymentDetails;
}

const BookingSchema = new Schema<IBooking>(
  {
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
    paymentDetials: {
      val_id: String,
      card_type: String,
      currency: String,
      tran_date: String,
      card_issuer: String,
      card_brand: String,
      card_issuer_country: String,
      card_issuer_country_code: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
