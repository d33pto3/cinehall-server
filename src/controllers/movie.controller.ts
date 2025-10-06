// MovieController
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { Movie, Show } from "../models";

// Get all movies
export const getMovies = async (_req: Request, res: Response) => {
  const movies = await Movie.find();

  res
    .status(200)
    .json({ success: true, message: "Fetch all movies", data: movies });
};

//create a new movie
export const createMovie = async (req: Request, res: Response) => {
  const { title, duration, genre, director, releaseDate, imageUrl, imageId } =
    req.body;

  console.log("img Id", imageId);

  if (!title || !duration || !genre || !releaseDate || !director) {
    throw new AppError("Please provide all the fields", 400);
  }

  const movie = new Movie({
    title,
    duration,
    genre,
    director,
    releaseDate,
    imageUrl,
    imageId,
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
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

  if (!deletedMovie) {
    throw new AppError("Movie not found!", 404);
  }

  res
    .status(200)
    .json({ success: "true", message: "Movie deleted!", data: deleteMovie });
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

export const nowShowingMovies = async (req: Request, res: Response) => {
  const today = new Date();

  const nowShowingMovieIds = await Show.distinct("movieId", {
    endTime: { $gte: today },
  });

  if (nowShowingMovieIds.length === 0) {
    res.status(200).json({
      success: true,
      message: "Fetch all now showing movies",
      movies: [],
    });

    return;
  }

  const movies = await Movie.find({
    _id: { $in: nowShowingMovieIds },
  })
    .sort({ releaseDate: -1 }) // newest movies first
    .lean();

  res.status(200).json({
    success: true,
    message: "Fetch all now showing movies",
    movies,
  });
};
