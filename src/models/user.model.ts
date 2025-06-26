import mongoose from "mongoose";
const Schema = mongoose.Schema;

export enum Role {
  USER = "user",
  ADMIN = "admin",
  HALLOWNER = "hallOwner",
}

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  role: Role;
  phone: number;
  avatar?: string;
  firebaseUid?: string;
  isVerified?: boolean;
  emailVerificationToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      default: function () {
        // Default to email prefix if name not provided
        return this.email.split("@")[0];
      },
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
    avatar: {
      type: String,
      required: false,
    },
    firebaseUid: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
    },
    emailVerificationToken: String,
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
