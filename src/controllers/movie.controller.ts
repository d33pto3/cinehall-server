// MovieController
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { Movie, Show } from "../models";
import { IMovie } from "../models/movie.model";
import { buildSearchQuery } from "../utils/searchQueryBuilder";
import { paginate } from "../utils/paginate";

// Get all movies
export const getMovies = async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Build dynamic search query
  const filter = buildSearchQuery<IMovie>(search, ["title", "genre"]);

  const paginatedResult = await paginate(Movie, {
    page,
    limit,
    filter,
    sort: "releaseDate:desc",
  });

  res.status(200).json({
    success: true,
    message: "Fetch all movies",
    pages: paginatedResult.pages,
    page: paginatedResult.page,
    count: paginatedResult.total,
    data: paginatedResult.data,
  });
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

  res.status(201).json({ success: true, message: "Created new Movie", movie });
};

// Get a single movie by ID
export const getMovieById = async (req: Request, res: Response) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    throw new AppError("Movie not found!", 404);
  }

  res.status(200).json({
    success: true,
    message: "Movie fetched!",
    movie,
  });
};

// Delete a Movie by Id
export const deleteMovie = async (req: Request, res: Response) => {
  const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

  if (!deletedMovie) {
    throw new AppError("Movie not found!", 404);
  }

  res
    .status(200)
    .json({ success: true, message: "Movie deleted!", movie: deleteMovie });
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
    .json({ success: true, message: "Movie updated!", movie: updatedMovie });
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
      data: [],
    });

    return;
  }

  const movies = await Movie.find({
    _id: { $in: nowShowingMovieIds },
  })
    .sort({ releaseDate: -1 })
    .lean();

  res.status(200).json({
    success: true,
    message: "Fetch all now showing movies",
    data: movies,
  });
};

export const comingSoonMovies = async (req: Request, res: Response) => {
  const today = new Date();

  // Coming soon are movies with release date in future
  const movies = await Movie.find({
    releaseDate: { $gt: today },
  })
    .sort({ releaseDate: 1 }) // Closest release date first
    .lean();

  res.status(200).json({
    success: true,
    message: "Fetch all coming soon movies",
    data: movies,
  });
};

export const comingSoonMovies = async (req: Request, res: Response) => {
  const today = new Date();

  const allMovies = await Movie.find();

  const nowShowingMovieIds = await Show.distinct("movieId", {
    endTime: { $gte: today },
  });

  const comingSoonMovies = allMovies.filter(
    (movie) => !nowShowingMovieIds.includes(movie._id),
  );

  if (comingSoonMovies.length === 0) {
    res.status(200).json({
      success: true,
      message: "Fetch all now showing movies",
      movies: [],
    });

    return;
  }

  res.status(200).json({
    success: true,
    message: "Fetch all now showing movies",
    data: comingSoonMovies,
  });
};
