import express from "express";
const router = express.Router();

import {
  createHall,
  deleteHall,
  getHallById,
  getHalls,
  updateHall,
} from "../controllers/hall.controller";

// Theater routes
router.route("/").get(getHalls).post(createHall);

router.route("/:id").get(getHallById).delete(deleteHall).put(updateHall);

export default router;
