import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1", adminRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(process.env.PORT, () => {
  console.log(`Admin Service is running on port ${process.env.PORT}`);
});
