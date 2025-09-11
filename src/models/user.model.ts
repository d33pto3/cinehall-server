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
  phone: string;
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
      select: false, // Don't expose passwords by default
    },
    role: {
      type: String,
      enum: Role,
      required: true,
    },
    phone: {
      type: String,
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
    emailVerificationToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.virtual("halls", {
  ref: "Hall", // Model to populate from
  localField: "_id", // User._id
  foreignField: "ownerId", // Hall.ownerId
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

export const User = mongoose.model<IUser>("User", userSchema);
