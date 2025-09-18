// ShowtimeController
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { Hall, Movie, Screen, Show } from "../models";
import { IShow, Slots } from "../models/show.model";
import { FilterQuery, PopulateOptions } from "mongoose";
import { paginate } from "../utils/paginate";
import { generateSeats } from "../utils/seatGenerator";

// Get all showtimes for a specific movie and theater
export const getShows = async (req: Request, res: Response) => {
  const shows = await Show.find()
    .populate("movieId", "title")
    .populate("screenId", "name");

  res
    .status(200)
    .json({ success: true, message: "Fetch all shows", data: shows });
};

export const getShowById = async (req: Request, res: Response) => {
  const show = await Show.findById(req.params.id)
    .populate("movieId", "title")
    .populate("screenId", "name");

  if (!show) {
    throw new AppError("Not found Show!", 404);
  }

  res.status(200).json({ success: "true", message: "Show fonud!", data: show });
};

export const createShow = async (req: Request, res: Response) => {
  const { movieId, screenId, slot, date, basePrice } = req.body;
  const slotKey = slot as keyof typeof Slots;

  // Validate Movie and Screen existence
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new AppError("Movie not found!", 404);
  }

  const screen = await Screen.findById(screenId);
  if (!screen) {
    throw new AppError("Screen not found!", 404);
  }

  // Validate slot
  if (!Object.keys(Slots).includes(slot)) {
    throw new AppError("Invalid slot value", 400);
  }

  // Generate startTime based on date + slot
  const [hour, minutes] = Slots[slotKey].split(":").map(Number);
  const startTime = new Date(date);
  startTime.setUTCHours(hour, minutes, 0, 0);

  // Calculate endTime = startTime + duration
  const endTime = new Date(startTime.getTime() + movie.duration * 60000);

  // Check for overlapping shows on the same screen and date
  const overlappingShow = await Show.findOne({
    screenId,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  });

  if (overlappingShow) {
    throw new AppError(
      `Screen already has a show overlapping this time slot on ${date}`,
      400,
    );
  }

  const show = new Show({
    movieId,
    screenId,
    startTime,
    endTime,
    basePrice,
    slot,
  });

  const newShow = await show.save();

  generateSeats(newShow._id, screen.rows, screen.columns);

  res
    .status(201)
    .json({ success: true, message: "Create new Show!", data: show });
};

export const getShowsForHallowner = async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Filters
  const dateFrom = req.query.dateFrom
    ? new Date(req.query.dateFrom as string)
    : null;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : null;

  // Get owned halls
  const ownedHalls = await Hall.find({ ownerId: req.user!._id }).select("_id");
  const ownedHallIds = ownedHalls.map((h) => h._id);

  if (ownedHalls.length === 0) {
    res.status(200).json({
      success: true,
      message: "No halls found for this account",
      data: [],
      count: 0,
      pages: 0,
      page,
    });
    return;
  }

  // Get screens of those halls
  const ownedScreens = await Screen.find({
    hallId: { $in: ownedHallIds },
  }).select("_id");
  const ownedScreenIds = ownedScreens.map((s) => s._id);

  if (ownedScreenIds.length === 0) {
    res.status(200).json({
      success: true,
      message: "No screens found in your halls",
      data: [],
      count: 0,
      pages: 0,
      page,
    });
    return;
  }

  // Build base filter
  const baseFilter: FilterQuery<IShow> = {
    screenId: { $in: ownedScreenIds },
  };

  // Build search filter on movie title
  const searchFilter: FilterQuery<IShow> = {};
  if (search) {
    const movieIds = await Movie.find({
      title: { $regex: search, $options: "i" },
    }).select("_id");
    const ids = movieIds.map((m) => m._id);
    searchFilter.movieId = { $in: ids };
  }

  const filter: FilterQuery<IShow> = {
    ...baseFilter,
    ...searchFilter,
  };

  // Apply date filter on startTime
  if (dateFrom || dateTo) {
    filter.startTime = {};
    if (dateFrom) filter.startTime.$gte = dateFrom;
    if (dateTo) filter.startTime.$lte = dateTo;
  }

  // Populate movie and screen info
  const populateOptions: PopulateOptions[] = [
    { path: "movieId", select: "title duration" },
    {
      path: "screenId",
      select: "name hallId",
      populate: { path: "hallId", select: "name address" },
    },
  ];

  // Paginate
  const paginatedResult = await paginate<IShow>(Show, {
    page,
    limit,
    filter,
    populate: populateOptions,
  });

  res.status(200).json({
    success: true,
    message: "Shows fetched successfully",
    pages: paginatedResult.pages,
    page: paginatedResult.page,
    count: paginatedResult.total,
    data: paginatedResult.data,
  });
};

export const updateShow = async (req: Request, res: Response) => {
  const updatedShow = await Show.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updatedShow) {
    throw new AppError("Not found Show!", 404);
  }

  res.status(200).json({
    success: true,
    message: "Update Show!",
    data: updatedShow,
  });
};

export const deleteShow = async (req: Request, res: Response) => {
  const deletedShow = await Show.findByIdAndDelete(req.params.id);

  if (!deletedShow) {
    throw new AppError("Not found Show!", 404);
  }

  res
    .status(200)
    .json({ success: true, message: "Delete Show!", data: deletedShow });
};
