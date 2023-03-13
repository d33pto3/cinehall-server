import express from "express";
const router = express.Router();

import {
  createTheater,
  getTheaters,
} from "../controllers/theaterController.js";

// Theater routes
router.post("/", createTheater);
router.get("/", getTheaters);

export default router;
