// ShowtimeController
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { Hall, Movie, Screen, Show } from "../models";
import { IShow, Slots } from "../models/show.model";
import mongoose, { FilterQuery, PopulateOptions } from "mongoose";
import { paginate } from "../utils/paginate";
import { generateSeats } from "../utils/seatGenerator";

// Get all showtimes for a specific movie and theater
export const getShows = async (req: Request, res: Response) => {
  const date = Array.isArray(req.query.date)
    ? (req.query.date[0] as string)
    : (req.query.date as string | undefined);
  const movieId = Array.isArray(req.query.movieId)
    ? (req.query.movieId[0] as string)
    : (req.query.movieId as string | undefined);
  const hallId = Array.isArray(req.query.hallId)
    ? (req.query.hallId[0] as string)
    : (req.query.hallId as string | undefined);

  // Validate that movieId is provided
  if (!movieId) {
    res.status(400).json({
      success: false,
      message: "movieId is required",
    });
    return; // Early return without value
  }

  const query: FilterQuery<IShow> = { movieId };

  // Add hallId filter if provided
  if (hallId) {
    query.screenId = hallId;
  }

  // Add date filter if provided
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.startTime = { $gte: start, $lte: end };
  }

  const shows = await Show.find(query)
    .populate("movieId", "title")
    .populate("screenId", "name");

  res
    .status(200)
    .json({ success: true, message: "Fetch all shows", data: shows });
};

export const getShowsForMovieByDate = async (req: Request, res: Response) => {
  const date = req.query.date;
  const movieId = req.query.movieId;

  res.status(200).json({ date, movieId });
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

export const getAvailableSlots = async (req: Request, res: Response) => {
  const date = Array.isArray(req.query.date)
    ? (req.query.date[0] as string)
    : (req.query.date as string | undefined);
  const movieId = Array.isArray(req.query.movieId)
    ? (req.query.movieId[0] as string)
    : (req.query.movieId as string | undefined);
  const hallId = Array.isArray(req.query.hallId)
    ? (req.query.hallId[0] as string)
    : (req.query.hallId as string | undefined);

  // Validate required fields
  if (!movieId || !date) {
    res.status(400).json({
      success: false,
      message: "movieId and date are required",
    });
    return;
  }

  // Build date range
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  interface MatchStage {
    movieId: mongoose.Types.ObjectId;
    startTime: { $gte: Date; $lte: Date };
    screenId?: { $in: mongoose.Types.ObjectId[] };
  }

  const matchStage: MatchStage = {
    movieId: new mongoose.Types.ObjectId(movieId),
    startTime: { $gte: start, $lte: end },
  };

  // If hallId provided, we need to filter by screens in that hall
  if (hallId) {
    // First get screens in this hall
    const screens = await Screen.find({
      hallId: new mongoose.Types.ObjectId(hallId),
    }).select("_id");

    const screenIds = screens.map((s) => s._id);

    if (screenIds.length === 0) {
      res.status(200).json({
        success: true,
        message: "No screens found in this hall",
        data: { availableSlots: [] },
      });
      return;
    }

    matchStage.screenId = { $in: screenIds };
  }

  // Aggregate to get unique slots
  const slots = await Show.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$slot",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        slot: "$_id",
        showCount: "$count",
      },
    },
    { $sort: { slot: 1 } },
  ]);

  res.status(200).json({
    success: true,
    message: "Fetched available slots",
    data: {
      date,
      movieId,
      hallId: hallId || null,
      availableSlots: slots,
    },
  });
};

export const getShowByDateSlotAndScreen = async (
  req: Request,
  res: Response,
) => {
  const date = Array.isArray(req.query.date)
    ? (req.query.date[0] as string)
    : (req.query.date as string | undefined);
  const slot = Array.isArray(req.query.slot)
    ? (req.query.slot[0] as string)
    : (req.query.slot as string | undefined);
  const screenId = Array.isArray(req.query.screenId)
    ? (req.query.screenId[0] as string)
    : (req.query.screenId as string | undefined);

  // Validate required fields
  if (!date || !slot || !screenId) {
    res.status(400).json({
      success: false,
      message: "date, slot, and screenId are required",
    });
    return;
  }

  // Validate screenId format
  if (!mongoose.Types.ObjectId.isValid(screenId)) {
    res.status(400).json({
      success: false,
      message: "Invalid screenId",
    });
    return;
  }

  // Validate slot
  if (!Object.keys(Slots).includes(slot)) {
    res.status(400).json({
      success: false,
      message: "Invalid slot value",
    });
    return;
  }

  // Build date range for the entire day
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  // Find the show
  const show = await Show.findOne({
    screenId: new mongoose.Types.ObjectId(screenId),
    slot: slot,
    startTime: { $gte: start, $lte: end },
  })
    .populate("movieId", "title duration genre posterUrl")
    .populate("screenId", "name hallId rows columns");

  if (!show) {
    res.status(404).json({
      success: false,
      message: "No show found for the given date, slot, and screen",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Show found successfully",
    data: show,
  });
};
