import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IScreen extends Document {
  name: string;
  hallId: mongoose.Types.ObjectId;
  capacity: number;
  rows: number;
  columns: number;
  createdAt: Date;
  updatedAt: Date;
}

const screenSchema = new Schema<IScreen>(
  {
    name: { type: String, required: true },
    hallId: { type: Schema.Types.ObjectId, ref: "Hall", required: true },
    capacity: { type: Number, required: true },
    rows: { type: Number, required: true },
    columns: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Screen = mongoose.model<IScreen>("Screen", screenSchema);
