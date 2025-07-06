import mongoose from "mongoose";
import { IBooking } from "../models/booking.model";
import { IUser } from "../models/user.model";

const ObjectId = mongoose.Types.ObjectId;
const SSLCOMMERZ_BASE_URL = "http://localhost:8000/api/v1";
const PRODUCT_DETAILS = {
  name: "Movie Ticket",
  category: "Ticket",
  profile: "non-physical-goods",
};

interface IPaymentData {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  product_name: string;
  product_category: string;
  product_profile: string;
  cus_name?: string;
  cus_email?: string;
  cus_country: string;
  cus_phone?: string;
  shipping_method: string;
}

export const preaparePaymentData = (
  booking: IBooking,
  user: IUser,
): IPaymentData => ({
  total_amount: booking.totalPrice,
  currency: "BDT",
  tran_id: new ObjectId().toString(),
  success_url: `${SSLCOMMERZ_BASE_URL}/payment/success`,
  fail_url: `${SSLCOMMERZ_BASE_URL}/payment/fail`,
  cancel_url: `${SSLCOMMERZ_BASE_URL}/payment/cancel`,
  ipn_url: `${SSLCOMMERZ_BASE_URL}payment/ipn`,
  product_name: PRODUCT_DETAILS.name,
  product_category: PRODUCT_DETAILS.category,
  product_profile: PRODUCT_DETAILS.profile,
  cus_name: user.username,
  cus_email: user.email,
  cus_country: "Bangladesh",
  cus_phone: user.phone?.toString(),
  shipping_method: "NO",
});
