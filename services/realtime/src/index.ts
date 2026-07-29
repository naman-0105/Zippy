import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { initSocket } from "./socket.js";
import internalRoute from "./routes/internal.js";

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
app.use(express.json());

app.use("/api/v1/internal", internalRoute);

const server = http.createServer(app);

initSocket(server);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

server.listen(process.env.PORT, () => {
  console.log(`Realtime service is running port ${process.env.PORT}`);
});
