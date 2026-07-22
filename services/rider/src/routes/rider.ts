import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  acceptOrder,
  rejectOrder,
  addRiderProfile,
  fetchMyCurrentOrder,
  fetchMyProfile,
  toggleRiderAvailablity,
  updateOrderStatus,
  verifyDeliveryOtp,
} from "../controllers/rider.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, uploadFile, addRiderProfile);

router.get("/myprofile", isAuth, fetchMyProfile);
router.patch("/toggle", isAuth, toggleRiderAvailablity);
router.post("/accept/:orderId", isAuth, acceptOrder);
router.post("/reject/:orderId", isAuth, rejectOrder);
router.get("/order/current", isAuth, fetchMyCurrentOrder);
router.put("/order/update/:orderId", isAuth, updateOrderStatus);
router.post("/order/verify-delivery/:orderId", isAuth, verifyDeliveryOtp);
router.post("/orders/:orderId/verify-delivery", isAuth, verifyDeliveryOtp);

export default router;
