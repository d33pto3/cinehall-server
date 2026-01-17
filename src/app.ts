/*==============================
Environment Setup
==============================*/
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.development" });
}

/*==============================
Core Packages and Imports
==============================*/
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectToDB from "./config/db";
import { requestLogger } from "./middlewares/requestLogger";
import Routes from "./routes";
import errorMiddleware from "./middlewares/errorHandler";
import { handleNotFound } from "./middlewares/handleNotFound";
import cookieParser from "cookie-parser";
import authMiddleware from "./middlewares/auth/authenticate.middleware";

/*==============================
Environment Setup
==============================*/
// import "./workers/seatCleanup";
import "./workers/bookingCleanup";

/*==============================
App Initialization
==============================*/
const app = express();
const PORT = process.env.PORT || 8000;

/*==============================
Connect to DB
==============================*/
connectToDB();

/*==============================
Middlewares
==============================*/
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://cinehall-client.vercel.app",
        "https://cinehall-client-rc7h.vercel.app",
      ]
    : [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:5173",
        "https://cinehall-client.vercel.app",
        "https://cinehall-client-rc7h.vercel.app",
      ];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV === "production") {
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      } else {
        // In development, allow all origins
        callback(null, true);
      }
    },
    credentials: true,
  }),
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(requestLogger);
app.use(cookieParser());

/*==========================
Routes
===========================*/
app.use("/api/v1", Routes);
app.get("/api/v1", (_req: Request, res: Response) => {
  res.status(200).send("Hello to CineHall!!!!");
});
app.get("/api/v1/test-auth", authMiddleware, (req: Request, res: Response) => {
  // Try accessing req.user - if TypeScript doesn't complain, it's working
  if (req.user) {
    console.log(req.user._id); // Should work
    console.log(req.user.role); // Should work
    console.log(req.user.email); // Should work
    // console.log(req.user.nonExistentProperty); // Should show TypeScript error
  }
  res.json({ message: "Type checking working!" });
});

/*========================== 
Error Handling
==========================*/
app.use(handleNotFound); // Handle endpoints not Found
app.use(errorMiddleware);

/*==========================
Start the Server
==========================*/
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`listening on port ${PORT}`);
});
