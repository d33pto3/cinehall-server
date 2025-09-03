import express from "express";
import {
  getUsers,
  updateUser,
  getUserById,
} from "../controllers/user.controller";
import asyncHandler from "../middlewares/asyncHandler";
const router = express.Router();

router.get("/", asyncHandler(getUsers));

router
  .route("/:id")
  .get(asyncHandler(getUserById))
  .put(asyncHandler(updateUser));

export default router;
