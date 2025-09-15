import mongoose, { Document, ObjectId } from "mongoose";
const Schema = mongoose.Schema;

export enum Slots {
  MORNING = "10:00",
  NOON = "13:00",
  AFTERNOON = "16:00",
  EVENING = "19:00",
}
export interface IShow extends Document {
  movieId: ObjectId;
  screenId: ObjectId;
  startTime: Date;
  endTime: Date;
  basePrice: number;
  slot: Slots;
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
    slot: {
      type: String,
      enum: Object.keys(Slots),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Show = mongoose.model<IShow>("Show", showSchema);
