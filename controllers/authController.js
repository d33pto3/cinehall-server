import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// create token function
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

//signup user
export const signup = async (req, res) => {
  let { name, email, password, role } = req.body;
  try {
    const user = await User.signup(name, email, password, role);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, name, role, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//signin user
export const signin = async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.signin(email, password);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
