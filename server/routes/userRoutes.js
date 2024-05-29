import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUserProfile,
  updateRole,
} from "../controller/userController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.put("/update", updateUserProfile);
router.post("/update-role", updateRole);
router.get("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:resetToken", resetPassword);

export { router as userRouter };
