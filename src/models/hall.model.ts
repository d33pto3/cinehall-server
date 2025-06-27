import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IHall extends Document {
  name: string;
  address: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

const hallSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    screens: {
      type: [Schema.Types.ObjectId],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Hall = mongoose.model<IHall>("Theater", hallSchema);
