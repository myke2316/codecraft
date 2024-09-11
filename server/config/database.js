import mongoose from "mongoose";
import Grid from "gridfs-stream";
import { GridFSBucket } from "mongodb";
let gfs, gridfsBucket, assignmentBucket, sandboxBucket;
const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB Connected at : ${conn.connection.host}`);
    //for teacher images assignment uploads
    gridfsBucket = new GridFSBucket(conn.connection.db, {
      bucketName: "uploads", // Collection name for GridFS
    });
    //for assignment
    assignmentBucket = new GridFSBucket(conn.connection.db, {
      bucketName: "assignment", // Bucket for assignment ZIP files
    });
    sandboxBucket = new GridFSBucket(conn.connection.db, {
      bucketName: "sandbox", // Bucket for assignment ZIP files
    });
    // gfs = Grid(conn.connection.db, mongoose.mongo);
    // gfs.collection("uploads");
    console.log("GridFS - Bucket initialized.");
  } catch (error) {
    console.log(`Error : ${error.message}`);
    process.exit(1);
  }
};

export {
  connectDb,
  mongoose,
  gfs,
  gridfsBucket,
  assignmentBucket,
  sandboxBucket,
};
