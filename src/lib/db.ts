import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/pharmacy";

export async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(MONGODB_URI);
}
