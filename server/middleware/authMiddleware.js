import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import UserModel  from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;
  console.log(token);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await UserModel.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not Authorized : Token Failed.");
    }
  } else {
    res.status(401);
    throw new Error("Not Authorized : No Token Found.");
  }
});

export { protect };
