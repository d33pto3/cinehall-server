import { PaymentStatus } from "../@types/enums";
import AppError from "./AppError";

interface SSLCommerzValidationResponse {
  status: string;
  tran_date: string;
  tran_id: string;
  val_id: string;
  amount: string;
  store_amount: string;
  currency: string;
  bank_tran_id: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  currency_type: string;
  currency_amount: string;
  currency_rate: string;
  base_fair: string;
  value_a: string;
  value_b: string;
  value_c: string;
  value_d: string;
  subscription_id: string;
  risk_level: string;
  risk_title: string;
}

export const validatePayment = async (
  val_id: string,
): Promise<SSLCommerzValidationResponse> => {
  if (!val_id) {
    throw new AppError("Payment validation ID is missing", 400);
  }

  const storeId = process.env.SSLC_STORE_ID;
  const storePass = process.env.SSLC_STORE_PASSWORD;
  const isLive = process.env.SSLC_IS_LIVE === "true";

  const baseUrl = isLive
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

  const validationUrl = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${storeId}&store_passwd=${storePass}&format=json&v=1`;

  try {
    const response = await fetch(validationUrl);
    const data = (await response.json()) as SSLCommerzValidationResponse;

    if (data.status === "VALID" || data.status === "VALIDATED") {
      return data;
    } else {
      throw new AppError("Payment validation failed: " + data.status, 400);
    }
  } catch (error: any) {
    throw new AppError(
      error.message || "Failed to validate payment with SSLCommerz",
      500,
    );
  }
};
