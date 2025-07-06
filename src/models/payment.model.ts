import mongoose, { ObjectId } from "mongoose";
const Schema = mongoose.Schema;

export interface IPayment {
  userId: ObjectId;
  val_id: string;
  card_type: string;
  currency: string;
  tran_date: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    val_id: String,
    card_type: String,
    currency: String,
    tran_date: String,
    card_issuer: String,
    card_brand: String,
    card_issuer_country: String,
    card_issuer_country_code: String,
  },
  {
    timestamps: true,
  },
);

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
