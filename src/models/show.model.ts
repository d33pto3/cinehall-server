import mongoose, { Document, ObjectId } from "mongoose";
const Schema = mongoose.Schema;

interface IShow extends Document {
  movieId: ObjectId;
  screenId: ObjectId;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
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
  },
  {
    timestamps: true,
  },
);

export const Show = mongoose.model<IShow>("Show", showSchema);
