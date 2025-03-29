import mongoose from "mongoose";
const Schema = mongoose.Schema;

enum Role {
  User = "user",
  Admin = "admin",
  HallOwner = "hallOwner",
}

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  role: Role;
  phone: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // validate email format
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Role,
      required: true,
    },
    phone: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
