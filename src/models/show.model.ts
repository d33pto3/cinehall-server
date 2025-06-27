import mongoose, { ObjectId } from "mongoose";
const Schema = mongoose.Schema;

interface IShow {
  movieId: ObjectId;
  hallId: ObjectId;
  startTime: Date;
  endTime: Date;
}

const showSchema = new Schema<IShow>(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
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
