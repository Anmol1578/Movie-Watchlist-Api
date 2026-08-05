import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";

// Import Routes
import movieRoutes from "./route/movieRoutes.js";
import authRoutes from "./route/authRoutes.js";
import watchlistRoutes from "./route/watchlistRoutes.js";

// Load Environment Variables
config();

const app = express();

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/movies", movieRoutes);
app.use("/auth", authRoutes);
app.use("/watchlist", watchlistRoutes);

// Wrapped Startup Flow to handle the async DB connection smoothly
const startServer = async () => {
  try {
    // 1. Await database connection before booting the web server
    await connectDB();

    // 2. Start listening and assign instance to 'server'
    const server = app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // 3. Attach Process Event Handlers within scope of the 'server' instance
    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection:", err);
      server.close(async () => {
        await disconnectDB();
        process.exit(1);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(`Failed to start the application server: ${error.message}`);
    process.exit(1);
  }
};

// Handle uncaught exceptions globally
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Kickstart execution
startServer();
