import { Router } from "express";
import authRouter from "./auth.route";
import movieRouter from "./movie.route";
import hallRouter from "./hall.route";
import showtimeRouter from "./showtime.route";
import bookingRouter from "./booking.route";

const router = Router();

router.get("/ex", (_req, res) => {
  res.json("This is an example route");
});

router.use("/auth", authRouter);
// router.use("/user", userRouter);
router.use("/movies", movieRouter);
router.use("/theaters", hallRouter);
router.use("/showtimes", showtimeRouter);
router.use("/bookings", bookingRouter);

export default router;
