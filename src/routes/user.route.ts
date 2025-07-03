import express from "express";
import { getUsers, updateUser } from "../controllers/user.controller";
import asyncHandler from "../middlewares/asyncHandler";
const router = express.Router();

router.get("/all", asyncHandler(getUsers));

router.route("/:id").put(asyncHandler(updateUser));

export default router;
