import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from "bcrypt";
import validator from "validator";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// static signup method
userSchema.statics.signup = async function (
  name,
  email,
  password,
  // role
) {
  //validation
  if (!email || !password) {
    throw Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(String(password), salt);

  const user = await this.create({
    email,
    password: hash,
    role: "user",
    name,
  });
  return user;
};

userSchema.statics.signin = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error("There was no user under this email");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Password doesn't match");
  }

  return user;
};

export default mongoose.model("User", userSchema);
