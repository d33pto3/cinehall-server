import express from "express";
import { paymentSuccessHandler } from "../controllers/payment.controller";
const router = express.Router();

router.post("/success", paymentSuccessHandler);
router.post("/ipn", paymentSuccessHandler);
// router.post("/ssl-payment-fail", paymentFailHandler);
// router.post("/ssl-payment-cancel", paymentCancelHandler);

export default router;
