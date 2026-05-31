import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URL environment variable is missing! Please configure it in your Vercel Dashboard Settings.");
  }
  
  await mongoose.connect(uri);
  console.log("MongoDB connected successfully");
};

export default connectDB;
