import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  createScreen,
  getScreens,
  getScreensByHall,
  updateScreen,
  deleteScreen,
  getScreenById,
} from "../controllers/screen.controller";
const router = express.Router();

// Screen routes

router
  .route("/")
  .get(asyncHandler(getScreens))
  .post(asyncHandler(createScreen));

router
  .route("/:id")
  .get(asyncHandler(getScreenById))
  .put(asyncHandler(updateScreen))
  .delete(asyncHandler(deleteScreen));

router.route("/hall/:hallId").get(asyncHandler(getScreensByHall));

export default router;
