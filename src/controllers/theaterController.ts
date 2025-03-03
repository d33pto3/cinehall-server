// TheaterController
import { Request, Response } from "express";
import Theater from "../models/theaterModel";

// Create a new theater
export const createTheater = async (req: Request, res: Response) => {
  try {
    const { name, address, capacity } = req.body;
    const theater = new Theater({ name, address, capacity });
    await theater.save();
    res.status(201).json(theater);
  } catch (err) {
    if (err instanceof Error) res.status(400).json({ message: err.message });
  }
};

export const getTheaters = async (req: Request, res: Response) => {
  try {
    const theaters = await Theater.find();
    res.status(200).json(theaters);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message });
  }
};

// get a single theater by id
export const getTheaterById = async (req: Request, res: Response) => {
  try {
    const theaters = await Theater.findOne();
    res.status(200).json(theaters);
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message });
  }
};

// delete a theater by id
export const deleteTheater = async (req: Request, res: Response) => {
  try {
    await Theater.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Theater deleted successfully" });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message });
  }
};

// update a theater by id
export const updateTheater = async (req: Request, res: Response) => {
  try {
    await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Theater updated successfully" });
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ message: err.message });
  }
};
