import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";

export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    domain: isProduction
      ? (process.env.COOKIE_DOMAIN || ".zippy.namangoyal.dev")
      : undefined,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  };
};

export const loginUser = TryCatch(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      message: "Authorization code is required",
    });
  }

  const googleRes = await oauth2client.getToken(code);

  oauth2client.setCredentials(googleRes.tokens);

  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`,
  );

  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    });
  }

  const token = jwt.sign(
    { user: { _id: user._id, role: user.role } },
    process.env.JWT_SEC as string,
    {
      expiresIn: "15d",
    }
  );

  res.cookie("accessToken", token, getCookieOptions());

  res.status(200).json({
    message: "Log in successful",
    user,
  });
});

const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user?._id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { role } = req.body as { role: Role };

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true },
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const token = jwt.sign(
    { user: { _id: user._id, role: user.role } },
    process.env.JWT_SEC as string,
    {
      expiresIn: "15d",
    }
  );

  res.cookie("accessToken", token, getCookieOptions());

  res.json({ message: "Role updated successfully", user });
});

export const logoutUser = TryCatch(async (req, res) => {
  res.clearCookie("accessToken", getCookieOptions());
  res.status(200).json({
    message: "Logged out successfully",
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(200).json(null);
  }

  if (!process.env.JWT_SEC) {
    return res.status(500).json({
      message: "Server configuration error",
    });
  }

  try {
    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SEC
    ) as jwt.JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      return res.status(200).json(null);
    }

    const user = await User.findById(decodedValue.user._id);
    return res.status(200).json(user || null);
  } catch {
    return res.status(200).json(null);
  }
});
