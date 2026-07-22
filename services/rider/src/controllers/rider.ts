import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import { Rider } from "../model/Rider.js";
import { handleRiderRejection } from "../config/orderMatching.consumer.js";

export const addRiderProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Rider Image is required",
      });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        message: "Failed to generate image buffer",
      });
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    const {
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      latitude,
      longitude,
    } = req.body;

    if (
      !phoneNumber ||
      !aadharNumber ||
      !drivingLicenseNumber ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingProfile = await Rider.findOne({
      userId: user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Rider profile already exists",
      });
    }

    const riderProfile = await Rider.create({
      userId: user._id,
      picture: uploadResult.url,
      phoneNumber,
      aadharNumber,
      drivingLicenseNumber,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      isAvailble: false,
      isVerified: false,
    });

    return res.status(201).json({
      message: "Rider profile created successfully",
      riderProfile,
    });
  },
);

export const fetchMyProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const account = await Rider.findOne({ userId: user._id });

    res.json(account);
  },
);

export const toggleRiderAvailablity = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can create rider profile",
      });
    }

    const { isAvailble, latitude, longitude } = req.body;

    if (typeof isAvailble !== "boolean") {
      return res.status(400).json({
        message: "isAvailble must be boolean",
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "location is required",
      });
    }

    const rider = await Rider.findOne({
      userId: user._id,
    });

    if (!rider) {
      return res.status(404).json({
        message: "Rider profile not found",
      });
    }

    if (isAvailble && !rider.isVerified) {
      return res.status(403).json({
        message: "Rider is not verified",
      });
    }

    rider.isAvailble = isAvailble;

    rider.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    rider.lastActiveAt = new Date();

    await rider.save();

    res.json({
      message: isAvailble ? "Rider is now online" : "Rider is now offline",
      rider,
    });
  },
);

export const acceptOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const riderUserId = req.user?._id;
  const { orderId } = req.params;

  if (!riderUserId) {
    return res.status(400).json({
      message: "Please Login",
    });
  }

  const rider = await Rider.findOne({ userId: riderUserId, isAvailble: true });

  if (!rider) {
    return res.status(404).json({ message: "rider not found" });
  }

  try {
    const { data } = await axios.put(
      `${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`,
      {
        orderId,
        riderId: rider._id.toString(),
        riderUserId: rider.userId,
        riderName: rider.picture,
        riderPhone: rider.phoneNumber,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );

    if (data.success) {
      await Rider.findOneAndUpdate(
        {
          userId: riderUserId,
          isAvailble: true,
        },
        { isAvailble: false },
        { new: true },
      );

      res.json({ message: "Order accepted" });
    }
  } catch (error: any) {
    const status = error.response?.status || 400;
    const message =
      error.response?.data?.message || "Order already taken or unavailable";
    res.status(status).json({
      message,
    });
  }
});

export const fetchMyCurrentOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;

    if (!riderUserId) {
      return res.status(401).json({
        message: "Please Login",
      });
    }

    const rider = await Rider.findOne({
      userId: riderUserId,
    });

    if (!rider) {
      return res.status(404).json({ message: "Rider profile not found" });
    }

    const restaurantServiceUrl =
      process.env.RESTAURANT_SERVICE ||
      process.env.VITE_RESTAURANT_SERVICE ||
      "http://localhost:5001";

    try {
      const { data } = await axios.get(
        `${restaurantServiceUrl}/api/order/current/rider?riderId=${rider._id}`,
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
          timeout: 5000,
        },
      );

      res.json({
        order: data || null,
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        return res.json({ order: null });
      }
      res.status(500).json({
        message: error.response?.data?.message || "Failed to fetch current order",
      });
    }
  },
);

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Please Login",
      });
    }

    const rider = await Rider.findOne({ userId: userId });

    if (!rider) {
      return res.status(404).json({
        message: "Please Login",
      });
    }

    const { orderId } = req.params;

    try {
      const { data } = await axios.put(
        `${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider`,
        { orderId },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        },
      );

      res.json({
        message: data.message,
      });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({
        message: error.response.data.message,
      });
    }
  },
);

export const verifyDeliveryOtp = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Please Login",
      });
    }

    const rider = await Rider.findOne({ userId: userId });

    if (!rider) {
      return res.status(404).json({
        message: "Rider profile not found",
      });
    }

    const { orderId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        message: "Delivery OTP is required",
      });
    }

    try {
      const { data } = await axios.post(
        `${process.env.RESTAURANT_SERVICE}/api/order/verify-delivery`,
        {
          orderId,
          riderId: rider._id.toString(),
          otp,
        },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        },
      );

      await Rider.findByIdAndUpdate(rider._id, { isAvailble: true });

      res.json({
        message: data.message || "Delivery verified successfully",
        order: data.order,
      });
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        message:
          error.response?.data?.message || "Delivery verification failed",
      });
    }
  },
);

export const rejectOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({
      message: "Please Login",
    });
  }

  const rider = await Rider.findOne({ userId });

  if (!rider) {
    return res.status(404).json({
      message: "Rider profile not found",
    });
  }

  const { orderId } = req.params;

  if (!orderId || typeof orderId !== "string") {
    return res.status(400).json({
      message: "Order ID is required",
    });
  }

  handleRiderRejection(orderId, rider._id.toString());

  res.json({
    message: "Order offer rejected",
  });
});
