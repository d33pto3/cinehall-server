// MovieController
import Movie from "../models/movieModle.js";

// Get all movies
export const getMovies = (req, res) => {
  Movie.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error getting movies!",
        error: error,
      });
    });
};

//create a new movie
export const createMovie = async (req, res) => {
  const movie = new Movie({
    title: req.body.title,
    duration: req.body.duration,
    genre: req.body.genre,
    director: req.body.director,
    releaseDate: req.body.releaseDate,
    imageUrl: req.body.imageUrl,
  });

  try {
    const newMovie = await movie.save();
    res.status(201).json(newMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a single movie by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
