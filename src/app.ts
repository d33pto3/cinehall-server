/*==============================
Core Packages and Imports
==============================*/
import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Connection from "./config/db/index";
import { requestLogger } from "./middlewares/requestLogger";
import Routes from "./routes";

// app
const app = express();

//middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(requestLogger);

// routes
app.use("/api/v1", Routes);

//database connect
Connection();

app.listen(process.env.PORT || 8000, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("listening on port " + process.env.PORT);
});
