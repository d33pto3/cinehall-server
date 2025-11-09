import cron from "node-cron";
import { cleanupExpiredBookings } from "../controllers/booking.controller";

// Run every minute
cron.schedule("*/1 * * * *", async () => {
  console.log("[CRON] Checking for expired unpaid bookings...");
  try {
    await cleanupExpiredBookings();
  } catch (error) {
    console.error("[CRON] Error in booking cleanup:", error);
  }
});

console.log("[CRON] Booking cleanup job scheduled");
