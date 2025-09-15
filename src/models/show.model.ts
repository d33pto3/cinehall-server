import mongoose, { Document, ObjectId } from "mongoose";
const Schema = mongoose.Schema;

interface IShow extends Document {
  hallId: ObjectId;
  movieId: ObjectId;
  screenId: ObjectId;
  startTime: Date;
  endTime: Date;
  basePrice: number;
}

const showSchema = new Schema<IShow>(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: [1, "Base price must be greater than 0"],
    },
  },
  {
    timestamps: true,
  },
);

export const Show = mongoose.model<IShow>("Show", showSchema);
