import mongoose from "mongoose";

const mongooseCache = globalThis.mongooseCache || {
  connection: null,
  promise: null,
};

globalThis.mongooseCache = mongooseCache;

const connectDB = async () => {
  if (mongooseCache.connection && mongoose.connection.readyState === 1) {
    return mongooseCache.connection;
  }

  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URL environment variable is missing! Please configure it in your Vercel Dashboard Settings.");
  }

  if (!mongooseCache.promise) {
    mongooseCache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000 })
      .then((connection) => {
        mongooseCache.connection = connection;
        console.log("MongoDB connected successfully");
        return connection;
      })
      .catch((error) => {
        mongooseCache.promise = null;
        throw error;
      });
  }

  return mongooseCache.promise;
};

export default connectDB;
