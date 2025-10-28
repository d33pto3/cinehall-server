import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  deleteSeat,
  updateSeat,
  releaseSeats,
  holdSeats,
  getSeatsByShowId,
  bookSeats,
} from "../controllers/seat.controller";

const router = express.Router();

router.get("/shows/:showId/seats", getSeatsByShowId);
router.post("/shows/:showId/seats/hold", holdSeats);
router.post("/shows/:showId/seats/release", releaseSeats);
router.post("/shows/:showId/seats/book", bookSeats);

router
  .route("/:id")
  .put(asyncHandler(updateSeat))
  .delete(asyncHandler(deleteSeat));

export default router;
