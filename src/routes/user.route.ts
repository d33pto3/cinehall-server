import express from "express";
import {
  getUsers,
  updateUser,
  getUserById,
  deleteUser,
} from "../controllers/user.controller";
import asyncHandler from "../middlewares/asyncHandler";
const router = express.Router();

router.get("/", asyncHandler(getUsers));

router
  .route("/:id")
  .get(asyncHandler(getUserById))
  .put(asyncHandler(updateUser))
  .delete(asyncHandler(deleteUser));

export default router;
