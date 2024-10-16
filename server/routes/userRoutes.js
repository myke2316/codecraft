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
  completeCourse,
  userCompleteCourse,
  permanentDeleteUser,
  declineTeacher,
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
router.delete("/permanentDelete/:userId", permanentDeleteUser);
router.patch("/unDeleteUser/:userId", undeleteUser);
router.patch("/approveTeacher", approveTeacher);router.patch("/declineTeacher", declineTeacher);
router.put("/edit-username", editUsername);
router.patch("/users/:userId/complete-course", completeCourse);
router.get("/users/completed-course", userCompleteCourse);
export { router as userRouter };
