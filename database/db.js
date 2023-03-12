import mongoose from "mongoose";

const OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.set("strictQuery", true);


const Connection = async(name, pass) => {
  const URL = `mongodb+srv://${name}:${pass}@mbstucinehall.36q9ood.mongodb.net/?retryWrites=true&w=majority`
  try{
    await mongoose.connect(URL, OPTIONS)
    console.log('Successfully connected to MongoDB server')
  } catch(err){ 
    console.log(err);
  }
}

export default Connection;