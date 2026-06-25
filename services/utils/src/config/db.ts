import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: process.env.DB_NAME || "Zippy",
    });

    console.log("Connected to MongoDB (Utils service)");
  } catch (error) {
    console.log("MongoDB connection error in Utils service:", error);
  }
};

export default connectDB;
