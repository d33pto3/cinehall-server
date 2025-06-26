import { Router } from "express";
import authRouter from "./auth";
import movieRouter from "./movie";
import theaterRouter from "./theater";
import showtimeRouter from "./showtime";
import bookingRouter from "./booking";

const router = Router();

router.get("/ex", (_req, res) => {
  res.json("This is an example route");
});

router.use("/auth", authRouter);
// router.use("/user", userRouter);
router.use("/movies", movieRouter);
router.use("/theaters", theaterRouter);
router.use("/showtimes", showtimeRouter);
router.use("/bookings", bookingRouter);

export default router;
