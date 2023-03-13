import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Connection from "./database/db.js";
import authRoute from "./routes/auth.js";
import movieRoutes from "./routes/movie.js";
import theatersRoutes from "./routes/theater.js";
import showtimesRoutes from "./routes/showtime.js";
import bookingsRoutes from "./routes/booking.js";

dotenv.config();

// app
const app = express();

//middlewares
app.use(bodyParser.json());
app.use(cors());

// routes
app.use("/api/user", authRoute);
app.use("/api/movies", movieRoutes);
app.use("/api/theaters", theatersRoutes);
app.use("/api/showtimes", showtimesRoutes);
app.use("/api/bookings", bookingsRoutes);

//database connect
const name = process.env.DB_USERNAME;
const pass = process.env.DB_PASSWORD;
Connection(name, pass);

app.listen(process.env.PORT || 8000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("listening on port " + process.env.PORT);
});
