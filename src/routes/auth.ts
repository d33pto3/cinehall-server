import express from "express";
const router = express.Router();

import { signup, signin } from "../controllers/authController";

router.post("/signup", signup);
router.post("/login", signin);

export default router;
