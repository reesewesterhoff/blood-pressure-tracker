import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/blood_pressure_tracker";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected!");
  } catch (err: any) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};
