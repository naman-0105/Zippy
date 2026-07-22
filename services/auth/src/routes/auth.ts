import express from "express";
import { addUserRole, loginUser, logoutUser, myProfile } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/logout", logoutUser);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", myProfile);

export default router;
