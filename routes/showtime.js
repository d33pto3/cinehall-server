import express from "express";
const router = express.Router();

import { getShowtimes } from "../controllers/showTimeController.js";

// Showtime routes
router.get("/movies/:movieId/theaters/:theaterId", getShowtimes);

export default router;
