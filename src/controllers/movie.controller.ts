// MovieController
import { Request, Response } from "express";
import Movie from "../models/movie.modle";
import AppError from "../utils/AppError";

// Get all movies
export const getMovies = async (req: Request, res: Response) => {
  const movies = await Movie.find();

  res.status(200).json(movies);
};

//create a new movie
export const createMovie = async (req: Request, res: Response) => {
  const { title, duration, genre, director, releaseDate, imageUrl } = req.body;

  const movie = new Movie({
    title,
    duration,
    genre,
    director,
    releaseDate,
    imageUrl,
  });

  await movie.save();

  res
    .status(201)
    .json({ success: true, message: "Created new Movie", data: movie });
};

// Get a single movie by ID
export const getMovieById = async (req: Request, res: Response) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    throw new AppError("Movie not found!", 404);
  }

  res.json(movie);
};

// Delete a Movie by Id
export const deleteMovie = async (req: Request, res: Response) => {
  const deletedMovie = await Movie.findById(req.params.id);

  if (!deletedMovie) {
    throw new AppError("Movie not found!", 404);
  }

  res.status(200).json({ success: "true", message: "Movie deleted!" });
};

// update a Hall by id
export const updateMovie = async (req: Request, res: Response) => {
  const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updatedMovie) {
    throw new AppError("Movie not found!", 404);
  }

  res
    .status(200)
    .json({ success: true, message: "Movie updated!", data: updatedMovie });
};
