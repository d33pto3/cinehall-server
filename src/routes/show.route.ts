// import express from 'express';
import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { getShows } from "../controllers/show.controller";
const router = express.Router();

// Showtime routes
router.route("/").get(asyncHandler(getShows));

export default router;
