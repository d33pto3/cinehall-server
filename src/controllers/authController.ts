// import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

// create token function
export const createToken = (_id: ObjectId) => {
  const secret = process.env.SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  return jwt.sign({ _id }, secret, { expiresIn: "7d" });
};

export const signup = () => {};
export const signin = () => {};

// //signup user
// export const signup = async (req: Request, res: Response) => {
//   const { name, email, password, role } = req.body;
//   try {
//     const user = await Auth.signup(name, email, password, role);

//     // create a token
//     const token = createToken(user._id);

//     res.status(200).json({
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       _id: user._id,
//       token,
//     });
//   } catch (err) {
//     if (err instanceof Error) {
//       return res.status(400).json({ error: err.message });
//     }
//   }
// };

// //signin user
// export const signin = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   try {
//     const user = await Auth.signin(email, password);

//     // create a token
//     const token = createToken(user._id);

//     res.status(200).json({ user, token });
//   } catch (err) {
//     if (err instanceof Error) {
//       return res.status(400).json({ error: err.message
//       });
//   }
// }
