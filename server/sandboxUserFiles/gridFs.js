import Grid from "gridfs-stream";
import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";
import { mongoose, gfs, gridfsBucket } from "../config/database.js";
// Import from the central database file

// Create a storage engine for multer-gridfs-storage
const storage = new GridFsStorage({
  url: process.env.MONGODB_URL,
  file: (req, file) => {
    return {
      bucketName: "uploads", // Collection name
      filename: file.originalname,
    };
  },
});

const upload = multer({ storage });

export { gfs, upload, gridfsBucket };
