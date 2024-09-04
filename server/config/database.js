import mongoose from "mongoose";
import Grid from "gridfs-stream";
import { GridFSBucket } from "mongodb";
let gfs, gridfsBucket;
const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB Connected at : ${conn.connection.host}`);
    gridfsBucket = new GridFSBucket(conn.connection.db, {
      bucketName: "uploads", // Collection name for GridFS
    });
    // gfs = Grid(conn.connection.db, mongoose.mongo);
    // gfs.collection("uploads");
    console.log("GridFS - Bucket initialized.");
  } catch (error) {
    console.log(`Error : ${error.message}`);
    process.exit(1);
  }
};

export { connectDb, mongoose, gfs, gridfsBucket };
