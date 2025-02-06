// import "./config/envConfig.js";
import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Connection from "./config/db/index.js";
import Routes from "./routes/index.js";

// app
const app = express();

//middlewares
app.use(bodyParser.json());
app.use(cors());

// routes
app.use("/api/v1", Routes);

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
