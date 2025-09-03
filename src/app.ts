/*==============================
Core Packages and Imports
==============================*/
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectToDB from "./config/db";
import { requestLogger } from "./middlewares/requestLogger";
import Routes from "./routes";
import errorMiddleware from "./middlewares/errorHandler";
import { handleNotFound } from "./middlewares/handleNotFound";
import cookieParser from "cookie-parser";

/*==============================
Environment Setup
==============================*/
const environment = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${environment}` });

console.log(`Running in ${environment} mode`);

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
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8081",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(requestLogger);
app.use(cookieParser());
app.use(errorMiddleware);

/*==========================
Routes
===========================*/
app.use("/api/v1", Routes);
app.get("/api/v1", (_req: Request, res: Response) => {
  res.status(200).send("Hello to CineHall!!!!");
});

/*========================== 
Error Handling
==========================*/
app.use(errorMiddleware); // Error handling middleware
app.use(handleNotFound); // Handle endpoints not Found

/*==========================
Start the Server
==========================*/
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("listening on port " + process.env.PORT);
});
