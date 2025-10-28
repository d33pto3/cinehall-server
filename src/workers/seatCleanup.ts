// workers/seatCleanup.ts
import cron from "node-cron";
import { cleanupExpiredHolds } from "../controllers/seat.controller";

// Run every minute
cron.schedule("*/1 * * * *", async () => {
  console.log("[CRON] Checking for expired held seats...");
  try {
    await cleanupExpiredHolds();
  } catch (error) {
    console.error("[CRON] Error in seat cleanup:", error);
  }
});

console.log("[CRON] Seat cleanup job scheduled");
