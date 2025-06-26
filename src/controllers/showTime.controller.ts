// ShowtimeController
import { Request, Response } from "express";
import Showtime from "../models/showTime.model.js";

// Get all showtimes for a specific movie and theater
export const getShowtimes = (req: Request, res: Response) => {
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
