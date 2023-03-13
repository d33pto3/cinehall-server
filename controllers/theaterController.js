// TheaterController
import Theater from "../models/theaterModel.js";

// Create a new theater
export const createTheater = async (req, res) => {
  try {
    const { name, address, capacity } = req.body;
    const theater = new Theater({ name, address, capacity });
    await theater.save();
    res.status(201).json(theater);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTheaters = async (req, res) => {
  try {
    const theaters = await Theater.find();
    res.status(200).json(theaters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
