import Grid from 'gridfs-stream';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer from 'multer';
import { mongoose } from '../config/database.js';
 // Import from the central database file

// Create a connection to MongoDB
const conn = mongoose.connection;

let gfs;

conn.once('open', () => {
  // Initialize GridFS
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  console.log('GridFS initialized.');
});

// Create a storage engine for multer-gridfs-storage
const storage = new GridFsStorage({
  url: process.env.MONGODB_URL,
  file: (req, file) => {
    return {
      bucketName: 'uploads', // Collection name
      filename: file.originalname,
    };
  },
});

const upload = multer({ storage });

export { gfs, upload };
