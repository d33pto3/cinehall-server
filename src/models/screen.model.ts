import mongoose from "mongoose";
const Schema = mongoose.Schema;

export enum Slots {
  MORNING = "10:00",
  NOON = "13:00",
  AFTERNOON = "16:00",
  EVENING = "19:00",
}

export interface ISlot {
  time: Slots;
  isAvailable: boolean;
}

const slotSchema = new Schema<ISlot>(
  {
    time: { type: String, enum: Object.values(Slots), required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }, // prevents creating an _id for each slot subdocument
);

export interface IScreen {
  name: string;
  hallId: mongoose.Types.ObjectId;
  capacity: number;
  rows: number;
  columns: number;
  slots: ISlot[];
  createdAt: Date;
  updatedAt: Date;
}

export type IScreenDocument = mongoose.Document & IScreen;

const screenSchema = new Schema<IScreenDocument>(
  {
    name: { type: String, required: true },
    hallId: { type: Schema.Types.ObjectId, ref: "Hall", required: true },
    capacity: { type: Number, required: true },
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
    slots: {
      type: [slotSchema],
      default: [
        {
          time: Slots.MORNING,
          isAvailable: true,
        },
        {
          time: Slots.NOON,
          isAvailable: true,
        },
        {
          time: Slots.AFTERNOON,
          isAvailable: true,
        },
        {
          time: Slots.EVENING,
          isAvailable: true,
        },
      ],
    },
  },
  { timestamps: true },
);

export const Screen = mongoose.model<IScreenDocument>("Screen", screenSchema);
