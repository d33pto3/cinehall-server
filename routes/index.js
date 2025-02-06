import { Router } from "express";
import authRouter from "./auth.js";
import movieRouter from "./movie.js";
import theaterRouter from "./theater.js";
import showtimeRouter from "./showtime.js";
import bookingRouter from "./booking.js";

const router = Router();

router.get("/ex", (req, res) => {
  res.json("This is an example route");
});

router.use("/auth", authRouter);
// router.use("/user", authRoute);
router.use("/movies", movieRouter);
router.use("/theaters", theaterRouter);
router.use("/showtimes", showtimeRouter);
router.use("/bookings", bookingRouter);

export default router;
