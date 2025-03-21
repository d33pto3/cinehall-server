import "dotenv/config";
import mongoose from "mongoose";

const connectToDB = async () => {
  const url = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.4uzqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

  const URL = url;

  try {
    await mongoose.connect(URL);

    console.log("Successfully connected to MongoDB server");
  } catch (err) {
    console.log("Error connecting to MongoDB: ", err);
  }
};

export default connectToDB;
