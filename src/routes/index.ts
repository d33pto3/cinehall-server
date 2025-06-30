import { Router } from "express";
import authRouter from "./auth.route";
import movieRouter from "./movie.route";
import hallRouter from "./hall.route";
import showRouter from "./show.route";
import bookingRouter from "./booking.route";
import userRouter from "./user.route";
import screenRouter from "./screen.route";
import seatRouter from "./seat.route";

const router = Router();

router.get("/ex", (_req, res) => {
  res.json("This is an example route");
});

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/movies", movieRouter);
router.use("/hall", hallRouter);
router.use("/show", showRouter);
router.use("/booking", bookingRouter);
router.use("/screen", screenRouter);
router.use("/seat", seatRouter);

export default router;
