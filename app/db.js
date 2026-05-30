import mongoose from "mongoose";
const connectDB = async () => {
   if(mongoose.connection.readyState >= 1){
    return;
   }
   await mongoose.connect(process.env.MONGO_URL)
   console.log("MongoDB connected");
}
export default connectDB;
