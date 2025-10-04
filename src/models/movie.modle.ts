import mongoose from "mongoose";
const Schema = mongoose.Schema;

interface IMovie {
  title: string;
  duration: number;
  genre: string;
  language: string;
  releaseDate: Date;
  director: string;
  imageUrl: string;
  imageId: string;
}

const MovieSchema = new Schema<IMovie>({
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes (like, 179)
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  language: {
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
  imageUrl: {
    type: String,
  },
  imageId: {
    type: String,
  },
});

MovieSchema.index({ releaseDate: -1 });

export const Movie = mongoose.model<IMovie>("Movie", MovieSchema);
