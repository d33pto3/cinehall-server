// HallController
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { Hall, Screen } from "../models";
import { IHall } from "../models/hall.model";
import { FilterQuery } from "mongoose";

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
  console.log(req.body);
  const { name, address, ownerId } = req.body;
  const hall = new Hall({ name, address, ownerId });
  await hall.save();
  res
    .status(201)
    .json({ success: true, message: "Created new hall", data: hall });
};

export const getHallsWithMetaForAdmin = async (req: Request, res: Response) => {
  const search = req.query.search as string;

  const query: FilterQuery<IHall> = {};

  if (search) {
    // Case-insensitive partial match on name or address
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  const halls = await Hall.find(query).populate("ownerId", "username");

  const hallData = await Promise.all(
    halls.map(async (hall) => {
      const screenCount = await Screen.countDocuments({ hallId: hall._id });

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

  res.status(200).json({
    success: true,
    message: "Fetched halls!",
    count: hallData?.length,
    data: hallData,
  });
};

export const getHalls = async (_req: Request, res: Response) => {
  const halls = await Hall.find();
  res.status(200).json(halls);
};

// Read a single Hall by id
export const getHallById = async (_req: Request, res: Response) => {
  const hall = await Hall.findOne();
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
