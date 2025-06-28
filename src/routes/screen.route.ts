import express from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  createScreen,
  getScreens,
  getScreensByHall,
} from "../controllers/screen.controller";
const router = express.Router();

// Screen routes

router
  .route("/")
  .get(asyncHandler(getScreens))
  .post(asyncHandler(createScreen));

router.route("/:hallId").get(asyncHandler(getScreensByHall));

export default router;
