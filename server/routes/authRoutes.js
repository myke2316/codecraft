import express from "express";
import passport from "passport";
import axios from "axios";
import generateToken from "../utils/generatetoken.js";
import UserModel from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();

//authenticate user using google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.CLIENT_URL}/redirect`,
    failureRedirect: `${process.env.CLIENT_URL}/login/failed`,
  })
);

//forward the request to googles' authentication server
router.get("/google", async (req, res) => {
  try {
    const response = await axios.get(
      "https://accounts.google.com/o/oauth2/v2/auth",
      {
        params: req.query,
      }
    );
    res.send(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//register or login user to Database or MongoDB
// router.get("/login/success", async (req, res) => {
//   // console.log("Received user data:", req.user?._json);
//   if (req.user) {
//     const userExist = await UserModel.findOne({ email: req.user._json.email });

//     if (userExist) {
//       generateToken(res, userExist._id);
//     } else {
//       const newUser = new UserModel({
//         username: req.user._json.name,
//         email: req.user._json.email,
//         password: Date.now(), //dummy password
//       });
//       generateToken(res, newUser._id);
//       await newUser.save();
//     }

//     res.status(200).json({
//       user: { ...req.user, role: !userExist?.role ? null : userExist.role },
//       message: "Successfully Logged In",
//       _id: userExist?._id,
//     });
//   } else {
//     res.status(403).json({
//       message: "Not Authorized",
//     });
//   }
// });

router.get("/login/success", async (req, res) => {
  // console.log("Received user data:", req.user?._json);
  if (req.user) {
    const userExist = await UserModel.findOne({ email: req.user._json.email });

    if (userExist) {
      generateToken(res, userExist._id);
      res.status(200).json({
        user: { ...req.user, role: userExist.role },
        message: "Successfully Logged In",
        _id: userExist._id,
        isNewUser: false, // Send flag indicating if user is newly registered
      });
    } else {
      const newUser = new UserModel({
        username: req.user._json.name,
        email: req.user._json.email,
        password: Date.now(), //dummy password
      });
      generateToken(res, newUser._id);
      await newUser.save();
      res.status(200).json({
        user: { ...req.user, role: "student" }, // Set a default role for new users
        message: "Successfully Registered",
        _id: newUser._id,
        isNewUser: true, // Send flag indicating if user is newly registered
      });
    }
  } else {
    res.status(403).json({
      message: "Not Authorized",
    });
  }
});

//login failed
router.get("/login/failed", (req, res) => {
  res.status(401).json({
    message: "Not Authorized lol",
  });
});

//logout
router.get("/logoutGoogle", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    } else {
      res.redirect(`${process.env.CLIENT_URL}/`);
    }
  });
});

export { router as authRoutes };
