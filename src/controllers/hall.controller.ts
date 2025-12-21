// HallController
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { Hall, Screen, Show } from "../models";
import { IHall } from "../models/hall.model";
import { buildSearchQuery } from "../utils/searchQueryBuilder";
import { paginate } from "../utils/paginate";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

interface IHallWithOwner extends Document {
  _id: string;
  name: string;
  address: string;
  ownerId: {
    _id: string;
    username: string;
  };
}

// Create a new Hall
export const createHall = async (req: Request, res: Response) => {
  const { name, address, ownerId } = req.body;
  const hall = new Hall({ name, address, ownerId });
  await hall.save();
  res
    .status(201)
    .json({ success: true, message: "Created new hall", data: hall });
};

export const getHallsWithMetaForAdmin = async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Build dynamic search query
  const filter = buildSearchQuery<IHall>(search, ["name", "address"]);

  // Screens filter: screen counts like 1, 2, 3+
  const screens = (req.query.screens as string)?.split(",") || [];

  // Date Range Filter
  const dateFrom = req.query.dateFrom
    ? new Date(req.query.dateFrom as string)
    : null;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : null;

  // Apply createdAt date filter
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = dateFrom;
    if (dateTo) filter.createdAt.$lte = dateTo;
  }

  const paginatedResult = await paginate(Hall, {
    page,
    limit,
    filter,
    populate: { path: "ownerId", select: "username" },
  });

  // const halls = await Hall.find(filter).populate("ownerId", "username");

  // Enhance result with screen counts and owner usernames
  const enrichedData = await Promise.all(
    paginatedResult.data.map(async (hall) => {
      const screenCount = await Screen.countDocuments({ hallId: hall._id });

      // Screens filter logic: must watch
      const includedByScreen =
        screens.length === 0 ||
        screens.some((s) => {
          if (s === "3+") return screenCount >= 3;
          return screenCount === parseInt(s);
        });

      if (!includedByScreen) return null;

      const owner = (hall as unknown as IHallWithOwner).ownerId;
      return {
        _id: hall._id,
        name: hall.name,
        address: hall.address,
        screens: screenCount,
        owner: owner?.username || null,
      };
    }),
  );

  const finalData = enrichedData.filter(Boolean);

  res.status(200).json({
    success: true,
    message: "Fetched halls!",
    pages: paginatedResult.pages,
    page: paginatedResult.page,
    count: finalData.length,
    data: finalData,
  });
};

export const getHallsForHallowner = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const search = req.query.search as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Build search filter
  const filter: Record<string, unknown> = { ownerId: req.user._id };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  const paginatedResult = await paginate(Hall, {
    page,
    limit,
    filter,
  });

  // Get screen counts for each hall
  const hallsWithScreenCounts = await Promise.all(
    paginatedResult.data.map(async (hall) => {
      const screenCount = await Screen.countDocuments({ hallId: hall._id });
      return {
        _id: hall._id,
        name: hall.name,
        address: hall.address,
        screens: screenCount,
      };
    }),
  );

  res.status(200).json({
    success: true,
    message: "Fetched halls for hall owner",
    pages: paginatedResult.pages,
    page: paginatedResult.page,
    count: hallsWithScreenCounts.length,
    data: hallsWithScreenCounts,
  });
};

export const getHalls = async (_req: Request, res: Response) => {
  const halls = await Hall.find();
  res.status(200).json({
    success: true,
    message: "Fetch all Halls",
    data: halls,
  });
};

export const getHallsByMovieAndDate = async (req: Request, res: Response) => {
  const { movieId, date } = req.query;

  if (!movieId) {
    throw new AppError("movieId is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(movieId as string)) {
    throw new AppError("Movie is not valid", 400);
  }

  let startOfDay: Date;
  let endOfDay: Date;

  if (date) {
    // If date is provided, use that specific day
    startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);

    endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);
  } else {
    // If date is not provided, use current day to 5 days forward
    startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    endOfDay = new Date();
    endOfDay.setDate(endOfDay.getDate() + 5);
    endOfDay.setHours(23, 59, 59, 999);
  }

  // Aggregation pipeline
  const halls = await Show.aggregate([
    {
      $match: {
        movieId: new mongoose.Types.ObjectId(movieId as string),
        startTime: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $lookup: {
        from: "screens",
        localField: "screenId",
        foreignField: "_id",
        as: "screen",
      },
    },
    { $unwind: "$screen" },
    {
      $lookup: {
        from: "halls",
        localField: "screen.hallId",
        foreignField: "_id",
        as: "hall",
      },
    },
    { $unwind: "$hall" },
    {
      $group: {
        _id: "$hall._id",
        name: { $first: "$hall.name" },
        address: { $first: "$hall.address" },
        // ownerId: { $first: "$hall.ownerId" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: date
      ? "Fetched halls showing the movie on this date"
      : "Fetched halls showing the movie from today to 5 days forward",
    count: halls.length,
    data: halls,
  });
};

// Read a single Hall by id
export const getHallById = async (req: Request, res: Response) => {
  if (!req.params.id && !ObjectId.isValid(req.params.id)) {
    throw new AppError("Provide valid hall!", 400);
  }

  const hall = await Hall.findById(req.params.id);

  if (!hall) {
    throw new AppError("Hall not found!", 404);
  }

  res.status(200).json(hall);
};

// Delete a Hall by id
export const deleteHall = async (req: Request, res: Response) => {
  const deletedHall = await Hall.findByIdAndDelete(req.params.id);

  if (!deletedHall) {
    throw new AppError("Hall not found", 404);
  }

  res.status(200).json({ success: true, message: "Hall deleted!" });
};

// update a Hall by id
export const updateHall = async (req: Request, res: Response) => {
  const updatedHall = await Hall.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updatedHall) {
    throw new AppError("Hall not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Hall updated successfully!",
    data: updatedHall,
  });
};
