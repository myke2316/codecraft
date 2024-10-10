import Grid from "gridfs-stream";
import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";
import {
  mongoose,
  gfs,
  gridfsBucket,
  assignmentBucket,
  sandboxBucket,
  signatureBucket,
} from "../config/database.js";
// Import from the central database file

// const teacherImageStorage = new GridFsStorage({
//   url: process.env.MONGODB_URL,
//   file: (req, file) => {
//     return {
//       bucketName: "teacher", // Bucket for teacher images
//       filename: file.originalname,
//     };
//   },
// });
// const teacherImageUpload = multer({ storage: teacherImageStorage });

const assignmentStorage = new GridFsStorage({
  url: process.env.MONGODB_URL,
  file: (req, file) => {
    return {
      bucketName: "assignment", // Bucket for assignment ZIP files
      filename: file.originalname,
    };
  },
});
const assignmentUpload = multer({ storage: assignmentStorage });

const sandboxStorage = new GridFsStorage({
  url: process.env.MONGODB_URL,
  file: (req, file) => {
    return {
      bucketName: "sandbox", // Bucket for assignment ZIP files
      filename: file.originalname,
    };
  },
});
const sandboxUpload = multer({ storage: sandboxStorage });

//for signatures of certificate
const signaturesStorage = new GridFsStorage({
  url: process.env.MONGODB_URL,
  file: (req, file) => {
    return {
      bucketName: "signature", // Collection name
      filename: file.originalname,
    };
  },
});
const signaturesUpload = multer({ storage: signaturesStorage });

//this is for teacher already
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

export {
  gfs,
  upload,
  gridfsBucket,
  assignmentBucket,
  assignmentUpload,
  sandboxUpload,
  sandboxBucket,
  signatureBucket,
  signaturesUpload,
};
