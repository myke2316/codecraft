import UserModel from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401).json({ error: "Invalid email or password!" });
    throw new Error("Invalid email or password");
  }
});
//register user
const registerUser = asyncHandler(async (req, res) => {
  //getting the posted json or the messag
  const { username, email, password, role } = req.body;

  //validate or find user based on email & password
  const emailExists = await UserModel.findOne({ email });
  const userExists = await UserModel.findOne({ username });
  if (userExists) {
    res.status(400).json({ error: "The username is already taken." });
    throw new Error("The username is already taken.");
  }
  if (emailExists) {
    res.status(400).json({ error: "The email is already taken." });
    throw new Error("This email is already taken.");
  }

  const user = await UserModel.create({ username, email, password, role });
  if (user) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401).json({ error: "Invalid User Credentials." });
    throw new Error("Invalid User Credentials");
  }
});

// Update user's role
const updateRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true }
    );
    if (user) {
      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//update profile password
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.body._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      password: user.password,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});


//logout user
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.cookie("connect.sid", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    message: "Logged Out Successfully",
  });
});

//forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(404).json({
      message: "User not Found",
    });
  }

  const resetToken = user.createPasswordResetToken();
  console.log(resetToken);
  user.save();

  const resetUrl = `${req.protocol}://localhost:${process.env.CLIENT_PORT}/reset-password/${resetToken}`;

  const message = `Forgot Password? Click on this link to reset your Password: ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "[CodeCraft] Your password reset token. (Valid for 10minutes)",
      message,
    });
    res.status(200).json({ message: "Token sent to email" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save();
    console.log(error);

    res.status(500).json({
      status: "error",
      message:
        "There was an error in sending the email. Please try again later",
    });
  }
});

//reset password
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400).json({
      status: "fail",
      message: "Token is invalid or has expired.",
    });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();

  generateToken(res, user._id);
  res.json({
    _id: user.id,
    username: user.username,
    password: user.password,
    role: user.role,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await UserModel.find().select("-password"); // Exclude password from the response
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  loginUser,
  registerUser,
  updateUserProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
  updateRole,getAllUsers
};
