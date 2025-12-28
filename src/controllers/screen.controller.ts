import { Request, Response } from "express";
import { Hall, Screen, Show } from "../models";
import AppError from "../utils/AppError";
import mongoose, { FilterQuery, PopulateOptions } from "mongoose";
import { IScreen, IScreenDocument } from "../models/screen.model";
import { buildSearchQuery } from "../utils/searchQueryBuilder";
import { paginate } from "../utils/paginate";

export const getScreens = async (_req: Request, res: Response) => {
  const screens = await Screen.find().populate("hallId", "name");

  console.log(screens);

  res
    .status(200)
    .json({ success: true, message: "Fetch all screens", data: screens });
};

export const getScreenById = async (req: Request, res: Response) => {
  const screen = await Screen.findById(req.params.id).populate(
    "hallId",
    "name",
  );

  if (!screen) {
    throw new AppError("Screen not found", 404);
  }

  res
    .status(200)
    .json({ success: true, message: "Screen fonud!", data: screen });
};

export const getScreensByHall = async (req: Request, res: Response) => {
  const hallId = req.params.hallId;

  if (!hallId) {
    throw new AppError("Please provide the hall id!", 400);
  }

  const hall = await Hall.findById(hallId);

  if (!hall) {
    throw new AppError("Not found hall", 404);
  }

  const screens = await Screen.find({ hallId });

  res.status(200).json({
    success: true,
    message: `Fetched all screens for hall ${hall.name}`,
    data: screens,
  });
};

export const getScreensByHallMovieAndDate = async (
  req: Request,
  res: Response,
) => {
  const { hallId, movieId, date } = req.query;

  if (!movieId) {
    throw new AppError("movieId is required", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(movieId as string)) {
    throw new AppError("Invalid movieId", 400);
  }

  if (hallId && !mongoose.Types.ObjectId.isValid(hallId as string)) {
    throw new AppError("Invalid hallId", 400);
  }

  // Build the match query
  interface MatchQuery {
    movieId: mongoose.Types.ObjectId;
    startTime?: { $gte: Date; $lte: Date };
  }

  const matchQuery: MatchQuery = {
    movieId: new mongoose.Types.ObjectId(movieId as string),
  };

  // Add date filter if provided
  if (date) {
    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    matchQuery.startTime = { $gte: startOfDay, $lte: endOfDay };
  }

  type PipelineStage =
    | { $match: MatchQuery | { "screen.hallId": mongoose.Types.ObjectId } }
    | {
        $lookup: {
          from: string;
          localField: string;
          foreignField: string;
          as: string;
        };
      }
    | { $unwind: string }
    | {
        $group: {
          _id: string;
          name: { $first: string };
          hallId: { $first: string };
        };
      };

  const pipeline: PipelineStage[] = [
    { $match: matchQuery },
    {
      $lookup: {
        from: "screens",
        localField: "screenId",
        foreignField: "_id",
        as: "screen",
      },
    },
    { $unwind: "$screen" },
  ];

  // Add hallId filter if provided
  if (hallId) {
    pipeline.push({
      $match: {
        "screen.hallId": new mongoose.Types.ObjectId(hallId as string),
      },
    });
  }

  // Group by screen
  pipeline.push({
    $group: {
      _id: "$screen._id",
      name: { $first: "$screen.name" },
      hallId: { $first: "$screen.hallId" },
    },
  });

  const screens = await Show.aggregate(pipeline);

  res.status(200).json({
    success: true,
    message: "Fetched screens showing the movie",
    count: screens.length,
    data: screens,
  });
};

// export const getScreensByHallMovieAndDate = async (
//   req: Request,
//   res: Response,
// ) => {
//   const { hallId, movieId, date } = req.query;

//   if (!hallId || !movieId) {
//     throw new AppError("hallId and movieId are required", 400);
//   }

//   if (
//     !mongoose.Types.ObjectId.isValid(hallId as string) ||
//     !mongoose.Types.ObjectId.isValid(movieId as string)
//   ) {
//     throw new AppError("Invalid hallId or movieId", 400);
//   }

//   let startOfDay: Date;
//   let endOfDay: Date;

//   if (date) {
//     // If date is provided, use that specific day
//     startOfDay = new Date(date as string);
//     startOfDay.setHours(0, 0, 0, 0);

//     endOfDay = new Date(date as string);
//     endOfDay.setHours(23, 59, 59, 999);
//   } else {
//     // If date is not provided, use current day to 5 days forward
//     startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     endOfDay = new Date();
//     endOfDay.setDate(endOfDay.getDate() + 5);
//     endOfDay.setHours(23, 59, 59, 999);
//   }

//   const screens = await Show.aggregate([
//     {
//       $match: {
//         movieId: new mongoose.Types.ObjectId(movieId as string),
//         startTime: { $gte: startOfDay, $lte: endOfDay },
//       },
//     },
//     {
//       $lookup: {
//         from: "screens",
//         localField: "screenId",
//         foreignField: "_id",
//         as: "screen",
//       },
//     },
//     { $unwind: "$screen" },
//     {
//       $match: {
//         "screen.hallId": new mongoose.Types.ObjectId(hallId as string),
//       },
//     },
//     {
//       $group: {
//         _id: "$screen._id",
//         name: { $first: "$screen.name" },
//         hallId: { $first: "$screen.hallId" },
//       },
//     },
//   ]);

//   res.status(200).json({
//     success: true,
//     message: date
//       ? "Fetched screens showing the movie in this hall on this date"
//       : "Fetched screens showing the movie in this hall from today to 5 days forward",
//     count: screens.length,
//     data: screens,
//   });
// };

export const getScreensForHallowner = async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Get filter parameters
  const dateFrom = req.query.dateFrom
    ? new Date(req.query.dateFrom as string)
    : null;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : null;
  const capacityMin = req.query.capacityMin
    ? parseInt(req.query.capacityMin as string)
    : null;
  const capacityMax = req.query.capacityMax
    ? parseInt(req.query.capacityMax as string)
    : null;
  const rowsMin = req.query.rowsMin
    ? parseInt(req.query.rowsMin as string)
    : null;
  const rowsMax = req.query.rowsMax
    ? parseInt(req.query.rowsMax as string)
    : null;
  const columnsMin = req.query.columnsMin
    ? parseInt(req.query.columnsMin as string)
    : null;
  const columnsMax = req.query.columnsMax
    ? parseInt(req.query.columnsMax as string)
    : null;

  // Get owned halls
  const ownedHalls = await Hall.find({ ownerId: req.user!._id }).select("_id");
  const ownedHallIds = ownedHalls.map((hall) => hall._id);

  if (ownedHalls.length === 0) {
    res.status(200).json({
      success: true,
      message: "No halls found for this account",
      data: [],
      count: 0,
      pages: 0,
      page: page,
    });
  }

  // Build base filter for owned halls
  const baseFilter: FilterQuery<IScreen> = {
    hallId: { $in: ownedHallIds },
  };

  // Build search query using your utility function
  const searchFilter = buildSearchQuery<IScreen>(search, ["name"]);

  // Combine filters
  const filter: FilterQuery<IScreen> = {
    ...baseFilter,
    ...searchFilter,
  };

  // Date Range Filter
  // const dateFrom = req.query.dateFrom
  //   ? new Date(req.query.dateFrom as string)
  //   : null;
  // const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : null;

  // Apply createdAt date filter - use proper type assertion
  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.$gte = dateFrom;
    if (dateTo) dateFilter.$lte = dateTo;

    (
      filter as FilterQuery<IScreen> & { createdAt?: Record<string, Date> }
    ).createdAt = dateFilter;
  }

  // Add capacity range filter
  if (capacityMin !== null || capacityMax !== null) {
    filter.capacity = {};
    if (capacityMin !== null) filter.capacity.$gte = capacityMin;
    if (capacityMax !== null) filter.capacity.$lte = capacityMax;
  }

  // Add rows range filter
  if (rowsMin !== null || rowsMax !== null) {
    filter.rows = {};
    if (rowsMin !== null) filter.rows.$gte = rowsMin;
    if (rowsMax !== null) filter.rows.$lte = rowsMax;
  }

  // Add columns range filter
  if (columnsMin !== null || columnsMax !== null) {
    filter.columns = {};
    if (columnsMin !== null) filter.columns.$gte = columnsMin;
    if (columnsMax !== null) filter.columns.$lte = columnsMax;
  }

  // Use proper typing for the populate option
  const populateOptions: PopulateOptions = {
    path: "hallId",
    select: "name address",
  };

  // Call paginate with proper types
  const paginatedResult = await paginate<IScreenDocument>(Screen, {
    page,
    limit,
    filter,
    populate: populateOptions,
  });

  res.status(200).json({
    success: true,
    message: "Screens fetched successfully",
    pages: paginatedResult.pages,
    page: paginatedResult.page,
    count: paginatedResult.total,
    data: paginatedResult.data,
  });
};

export const createScreen = async (req: Request, res: Response) => {
  const { name, hallId, rows, columns } = req.body;

  if (!name || !hallId || !rows || !columns) {
    throw new AppError("Give all the required information", 400);
  }

  const hall = await Hall.findById(hallId);

  if (!hall) {
    throw new AppError("Hall not found", 404);
  }

  // Optional: Only the owner of the hall or an admin can create screens
  // if (
  //   req.user.role !== "admin" &&
  //   hall.ownerId.toString() !== req.user.id
  // ) {
  //   return res.status(403).json({ message: "Forbidden: Not your hall" });
  // }

  const newScreen = await Screen.create({
    name,
    hallId,
    rows,
    columns,
    capacity: rows * columns,
  });

  res.json({ success: true, message: "Create new Screen", data: newScreen });
};

export const addScreenToHall = async (req: Request, res: Response) => {
  const { name, rows, columns } = req.body;
  const { hallId } = req.params;

  if (!name || !rows || !columns) {
    throw new AppError("Name, rows, and columns are required", 400);
  }

  // Check if screen name is unique within this hall
  const existingScreen = await Screen.findOne({
    hallId,
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });

  if (existingScreen) {
    throw new AppError(
      "A screen with this name already exists in your hall",
      400,
    );
  }

  const screen = new Screen({
    name,
    rows,
    columns,
    hallId,
    capacity: rows * columns,
  });

  await screen.save();

  res.status(201).json({
    success: true,
    message: "Screen added successfully",
    data: screen,
  });
};

export const updateScreen = async (req: Request, res: Response) => {
  const { name, hall, rows, columns } = req.body;

  if (hall) {
    const hallId = await Hall.findById(hall);

    if (!hallId) {
      throw new AppError("Hall not found", 404);
    }
  }

  const updatedScreen = await Screen.findByIdAndUpdate(
    req.params.id,
    { name, hallId: hall, columns, rows, capacity: columns * rows },
    { new: true },
  );

  if (!updatedScreen) {
    throw new AppError("Screen not found!", 404);
  }

  res
    .status(200)
    .json({ success: true, message: "Updated Screen", data: updatedScreen });
};

export const deleteScreen = async (req: Request, res: Response) => {
  const deletedScreen = await Screen.findByIdAndDelete(req.params.id);

  if (!deletedScreen) {
    throw new AppError("Screen not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Screen deleted!",
    data: deletedScreen,
  });
};
