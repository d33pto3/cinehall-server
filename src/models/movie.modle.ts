import mongoose from "mongoose";
const Schema = mongoose.Schema;

interface IMovie {
  title: string;
  imageUrl: string;
  duration: number;
  genre: string;
  releaseDate: Date;
  director: string;
}

const MovieSchema = new Schema<IMovie>({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  duration: {
    type: Number,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
});

export const Movie = mongoose.model<IMovie>("Movie", MovieSchema);
