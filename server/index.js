import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./config/database.js";
import passportUtil from "./utils/passport.js";
import { userRouter } from "./routes/userRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { classRouter } from "./routes/classRoutes.js";
import { courseRouter } from "./routes/courseRoute.js";
import { progressRouter } from "./routes/studentCourseProgressRoutes.js";
import { analyticsRouter } from "./routes/userAnalyticsRoutes.js";

dotenv.config();
connectDb();
const PORT = process.env.SERVER_PORT || 8000;
const app = express();

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  next();
});

//to be able to respond and get json files and is a middleware for backend and frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET, POST, PATCH, DELETE, PUT",
  })
);
app.use(cookieParser());
passportUtil(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/class", classRouter);
app.use("/auth", authRoutes);
app.use("/course", courseRouter);
app.use("/userProgress", progressRouter);
app.use("/analytics", analyticsRouter);
app.get("/", (req, res) => {
  res.send("Server or api is running.");
});
