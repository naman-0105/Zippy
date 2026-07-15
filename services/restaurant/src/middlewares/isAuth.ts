import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  restaurantId: string;
}

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

    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SEC as string
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      res.status(401).json({
        message: "Invalid token",
      });
      return;
    }

    req.user = decodedValue.user;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Please Login - Invalid or expired token",
    });
  }
};

export const isSeller = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user;

  if (user && user.role !== "seller") {
    res.status(401).json({
      message: "You are not authorized seller",
    });
    return;
  }

  next();
};
