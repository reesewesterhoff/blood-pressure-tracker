import mongoose from "mongoose";

const DEFAULT_MONGO_URI = "mongodb://localhost:27017/blood_pressure_tracker";
const DEFAULT_MAX_POOL_SIZE = 10;
const DEFAULT_MIN_POOL_SIZE = 0;

export const parsePoolSize = (
  value: string | undefined,
  fallback: number
): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || DEFAULT_MONGO_URI;
    const maxPoolSize = parsePoolSize(
      process.env.MONGO_MAX_POOL_SIZE,
      DEFAULT_MAX_POOL_SIZE
    );
    const minPoolSize = parsePoolSize(
      process.env.MONGO_MIN_POOL_SIZE,
      DEFAULT_MIN_POOL_SIZE
    );

    // The session store reuses this same Mongoose client (see server.ts).
    await mongoose.connect(mongoURI, {
      maxPoolSize,
      minPoolSize,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("Unknown MongoDB connection error");
    }
    // Exit process with failure
    process.exit(1);
  }
};
