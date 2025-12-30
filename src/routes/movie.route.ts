// import express from 'express';
import express from "express";
const router = express.Router();

import {
  getMovies,
  createMovie,
  getMovieById,
  updateMovie,
  deleteMovie,
  nowShowingMovies,
  comingSoonMovies,
} from "../controllers/movie.controller";
import asyncHandler from "../middlewares/asyncHandler";

// Movie routes
router.route("/").get(asyncHandler(getMovies)).post(asyncHandler(createMovie));

router.route("/now-showing").get(asyncHandler(nowShowingMovies));
router.route("/coming-soon").get(asyncHandler(comingSoonMovies));

router
  .route("/:id")
  .get(asyncHandler(getMovieById))
  .put(asyncHandler(updateMovie))
  .delete(asyncHandler(deleteMovie));

export default router;
