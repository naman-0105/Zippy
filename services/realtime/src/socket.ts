import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

let io: Server;

export const initSocket = (server: http.Server) => {
  const defaultFrontendOrigin =
    process.env.NODE_ENV === "production"
      ? "https://zippy.namangoyal.dev"
      : "http://localhost:5173";

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || defaultFrontendOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;

      if (!cookieHeader) {
        return next(new Error("Unauthorized"));
      }

      const cookies = Object.fromEntries(
        cookieHeader
          .split(";")
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => {
            const [key, ...v] = c.split("=");
            return [key, v.join("=")];
          })
      );

      const token = cookies.accessToken;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SEC!) as any;

      if (!decoded || !decoded.user) {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = decoded.user;

      next();
    } catch (error) {
      console.log("Socket auth failed: ", error);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    if (!user) {
      socket.disconnect();
      return;
    }

    const userId = user._id;

    socket.join(`user:${userId}`);

    if (user.restaurantId) {
      socket.join(`restaurant:${user.restaurantId}`);
    }

    console.log(`User connected: ${userId}`);
    console.log("Socket rooms: ", [...socket.rooms]);

    socket.on("join:restaurant", (restaurantId: string) => {
      if (restaurantId) {
        socket.join(`restaurant:${restaurantId}`);
        console.log(`User ${userId} joined room: restaurant:${restaurantId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected:${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};
