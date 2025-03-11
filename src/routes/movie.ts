// import express from 'express';
import express from "express";
const router = express.Router();

import {
  getMovies,
  createMovie,
  getMovieById,
} from "../controllers/movieController";

// Movie routes
router.route("/").get(getMovies).post(createMovie);

router.get("/:id", getMovieById);

export default router;
