import express from "express";
const router = express.Router();

import {
  createTheater,
  deleteTheater,
  getTheaterById,
  getTheaters,
  updateTheater,
} from "../controllers/theaterController";

// Theater routes
router.route("/").get(getTheaters).post(createTheater);

router
  .route("/:id")
  .get(getTheaterById)
  .delete(deleteTheater)
  .put(updateTheater);

router.get("/", getTheaterById);

export default router;
