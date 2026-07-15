import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../model/User.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      res.status(401).json({
        message: "Please Login - No auth token",
      });
      return;
    }

    if (!process.env.JWT_SEC) {
      console.error("JWT_SEC environment variable is not set");
      res.status(500).json({
        message: "Server configuration error",
      });
      return;
    }

    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SEC
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({
        message: "Invalid Token",
      });
      return;
    }

    req.user = decodedValue.user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: "Token expired - Please login again",
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid token - Please login again",
      });
    } else {
      res.status(401).json({
        message: "Authentication error",
      });
    }
  }
};
