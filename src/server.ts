import express from "express";
import "dotenv/config";
import colors from "colors";
import { AppDataSource } from "./config/typeorm";

const app = express();

app.use(express.json());

const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log(colors.magenta.bold("Database connected successfully"));
  } catch (error) {
    console.error(colors.red.bold("Error connecting to the database"), error);
  }
};

connectDB();

export default app;