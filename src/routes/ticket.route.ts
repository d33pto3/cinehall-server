import express from "express";
import { getAllTickets } from "../controllers/ticket.controller";
import asyncHandler from "../middlewares/asyncHandler";

const router = express.Router();

router.route("/").get(asyncHandler(getAllTickets));

export default router;
