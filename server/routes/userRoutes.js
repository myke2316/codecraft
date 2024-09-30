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
  getAllUsers,
  deleteUser,
  approveTeacher,
  editUsername,
  getSingleUser,
  undeleteUser,
} from "../controller/userController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.put("/update", updateUserProfile);
router.post("/update-role", updateRole);
router.get("/logout", logoutUser);
router.get("/get-user/:userId", getSingleUser);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:resetToken", resetPassword);
router.get("/getAllUser", getAllUsers);
router.delete("/deleteUser/:userId", deleteUser);
router.patch("/unDeleteUser/:userId", undeleteUser);
router.patch("/approveTeacher", approveTeacher);
router.put("/edit-username", editUsername);
export { router as userRouter };
