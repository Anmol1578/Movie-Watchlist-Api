import express from "express";
import { config } from "dotenv";
import { connectDB } from "./config/db.js";

// Import Routes
import movieRoutes from "./route/movieRoutes.js";
import authRoutes from "./route/authRoutes.js";

config();
connectDB();

const app = express();

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/movies", movieRoutes);
app.use("/auth", authRoutes);

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
