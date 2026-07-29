import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.js";
import cors from "cors";

dotenv.config();

const app = express();

const defaultFrontendOrigin =
  process.env.NODE_ENV === "production"
    ? "https://zippy.namangoyal.dev"
    : "http://localhost:5173";

app.use(
  cors({
    origin: process.env.FRONTEND_URL || defaultFrontendOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
  connectDB();
});
