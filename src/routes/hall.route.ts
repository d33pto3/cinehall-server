import express from "express";
const router = express.Router();

import {
  createHall,
  deleteHall,
  getHallById,
  getHalls,
  getHallsForHallowner,
  getHallsWithMetaForAdmin,
  updateHall,
} from "../controllers/hall.controller";
import asyncHandler from "../middlewares/asyncHandler";

// Theater routes
router.route("/").get(asyncHandler(getHalls)).post(asyncHandler(createHall));

// Admin routes
router.get("/admin", asyncHandler(getHallsWithMetaForAdmin));

// Hallowner routes
router.get("/hallowner", asyncHandler(getHallsForHallowner));

router
  .route("/:id")
  .get(asyncHandler(getHallById))
  .delete(asyncHandler(deleteHall))
  .put(asyncHandler(updateHall));

export default router;
