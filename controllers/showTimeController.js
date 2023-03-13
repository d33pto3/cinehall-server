// ShowtimeController
import Showtime from "../models/showTimeModel.js";

// Get all showtimes for a specific movie and theater
export const getShowtimes = (req, res) => {
  Showtime.find({
    movieId: req.params.movieId,
    theaterId: req.params.theaterId,
  })
    .then((showtimes) => {
      res.status(200).json({
        showtimes: showtimes,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error getting showtimes!",
        error: error,
      });
    });
};
