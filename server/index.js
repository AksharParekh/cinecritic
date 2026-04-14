import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import routes from "./src/routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1", routes);

// lightweight health check for Vercel/function readiness
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// In serverless environments (Vercel) we must not call `listen()` or exit the process.
// Export the Express `app` so Vercel can invoke it as a serverless function.

const mongoUrl = process.env.MONGODB_URL;

if (mongoUrl) {
  mongoose.connect(mongoUrl)
    .then(() => console.log("Mongodb connected"))
    .catch((err) => console.log("Mongodb connection error:", err));
} else {
  console.warn("MONGODB_URL is not set; database routes will fail until it is configured.");
}

export default app;

// For local development you can still start the server using a small script
// that imports this file and calls `app.listen(...)`.