// ShowtimeController
import { Request, Response } from "express";
import Show from "../models/show.model.js";

// Get all showtimes for a specific movie and theater
export const getShows = (req: Request, res: Response) => {
  Show.find({
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
