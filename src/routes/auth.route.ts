import express from "express";
const router = express.Router();

import {
  emailPasswordLogin,
  firebaseLogin,
  register,
  logout,
} from "../controllers/auth.controller";
import asyncHandler from "../middlewares/asyncHandler";
// import authMiddleware from "../middlewares/authMiddleware";

// Firebase login route
router.post("/login/firebase", asyncHandler(firebaseLogin));

// Email/password reg route
router.post("/register", asyncHandler(register));

// email/pass Login route
router.post("/login/email", asyncHandler(emailPasswordLogin));

// logout route
router.post("/logout", asyncHandler(logout));

export default router;
