import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // читає змінні з .env

const { MONGO_URL } = process.env;

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Підключення до MongoDB успішне!");
  } catch (error) {
    console.error("❌ Помилка підключення до MongoDB:", error.message);
    process.exit(1); // зупиняє процес, якщо зʼєднання не вдалося
  }
};
