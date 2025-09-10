import express from "express";
import {
  deleteTicket,
  getAllTickets,
  getTicket,
} from "../controllers/ticket.controller";
import asyncHandler from "../middlewares/asyncHandler";

const router = express.Router();

router.route("/").get(asyncHandler(getAllTickets));
router
  .route("/:id")
  .get(asyncHandler(getTicket))
  .delete(asyncHandler(deleteTicket));

export default router;
