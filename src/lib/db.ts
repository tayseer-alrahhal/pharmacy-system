import mongoose from "mongoose";

// const MONGODB_URI = "mongodb://localhost:27017/pharmacy";
const MONGODB_URI = "mongodb+srv://learnova:VifRxi1st3h1Epi6@learnova.dfptnye.mongodb.net/pharmacy-system?retryWrites=true&w=majority&appName=pharmacy-system";

export async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(MONGODB_URI);
}
