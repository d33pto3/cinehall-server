// import express from 'express';
import express from "express";
const router = express.Router();

import {
  getMovies,
  createMovie,
  getMovieById,
} from "../controllers/movieController";

// Movie routes
router.post("/", createMovie);
router.get("/", getMovies);
router.get("/:id", getMovieById);

export default router;
