// import "./config/envConfig.js";
import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Connection from "./config/db/index.js";
import Routes from "./routes/index.js";
import { requestLogger } from "./middlewares/requestLogger.js";

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
