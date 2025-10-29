import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  deleteSeat,
  updateSeat,
  releaseSeats,
  holdSeats,
  getSeatsByShowId,
  bookSeats,
  getSeatById,
} from "../controllers/seat.controller";

const router = express.Router();

router.get("/shows/:showId", getSeatsByShowId);
router.post("/shows/:showId/hold", holdSeats);
router.post("/shows/:showId/release", releaseSeats);
router.post("/shows/:showId/book", bookSeats);

router
  .route("/:id")
  .get(asyncHandler(getSeatById))
  .put(asyncHandler(updateSeat))
  .delete(asyncHandler(deleteSeat));

export default router;
