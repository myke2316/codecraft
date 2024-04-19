import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./config/database.js";
import passportUtil from "./utils/passport.js";


dotenv.config();
connectDb();
const PORT = process.env.SERVER_PORT || 8000;
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  next();
});

//to be able to respond and get json files and is a middleware for backend and frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET, POST, PATCH, DELETE, PUT",
    credentials: true,
  })
);

app.use(cookieParser());
passportUtil(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server or api is running.");
});
