import mongoose, { Document, ObjectId } from "mongoose";
const Schema = mongoose.Schema;

export interface IHall extends Document {
  name: string;
  address: string;
  ownerId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const hallSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Hall = mongoose.model<IHall>("Hall", hallSchema);
