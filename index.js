import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Connection from "./database/db.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import adminRoute from "./routes/admin.js";
dotenv.config();

// app
const app = express();

//middlewares
app.use(bodyParser.json());
app.use(cors());

// routes
app.use("/api/user", authRoute);
// app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);

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
