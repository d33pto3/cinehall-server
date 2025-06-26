import mongoose, { Schema } from "mongoose";

export interface IScreen extends Document {
  name: string;
}

const screenSchema = new Schema<IScreen>({
  name: {
    type: String,
    required: true,
  },
});

export const Screen = mongoose.model<IScreen>("Screen", screenSchema);
