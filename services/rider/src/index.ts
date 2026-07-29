import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import cors from "cors";
import riderRoutes from "./routes/rider.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startOrderReadyConsumer } from "./config/orderMatching.consumer.js";

dotenv.config();

await connectRabbitMQ();
startOrderReadyConsumer();

const app = express();

const defaultFrontendOrigin =
  process.env.NODE_ENV === "production"
    ? "https://zippy.namangoyal.dev"
    : "http://localhost:5173";

app.use(
  cors({
    origin: process.env.FRONTEND_URL || defaultFrontendOrigin,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/rider", riderRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(process.env.PORT, () => {
  console.log(`Rider service is running on port ${process.env.PORT}`);
  connectDB();
});
