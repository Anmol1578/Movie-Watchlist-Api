// import { PrismaClient } from "@prisma/client"; // Direct package import
// import { PrismaPg } from "@prisma/adapter-pg";
// import "dotenv/config";

// // Initialize the Prisma 7 driver adapter using your connection string
// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// const prisma = new PrismaClient({
//   adapter,
//   log:
//     process.env.NODE_ENV === "development"
//       ? ["query", "error", "warn"]
//       : ["error"],
// });

// const connectDB = async () => {
//   try {
//     await prisma.$connect();
//     console.log("DB Connected via Prisma");
//   } catch (error) {
//     console.error(`Database connection error: ${error.message}`);
//     throw error;
//   }
// };

// const disconnectDB = async () => {
//   try {
//     await prisma.$disconnect();
//     console.log("Database disconnected safely.");
//   } catch (error) {
//     console.error(`Error during database disconnection: ${error.message}`);
//   }
// };

// export { prisma, connectDB, disconnectDB };


import { PrismaClient } from "../generated/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// Initialize the Prisma 7 driver adapter using your connection string
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB Connected via Prisma");
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected safely.");
  } catch (error) {
    console.error(`Error during database disconnection: ${error.message}`);
  }
};

export { prisma, connectDB, disconnectDB };