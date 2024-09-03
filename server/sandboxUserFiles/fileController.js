import { gfs, upload } from "./gridFs.js";
import File from "./fileModel.js";


// Controller function for handling file uploads
export const uploadFiles = (req, res) => {
  // Use multer middleware to handle file uploads
  upload.array("files")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading files", error: err.message });
    }

    try {
      // Access uploaded files
      const files = req.files;
      const userId = req.body.userId; // Get userId from the request body

      const imagePromises = files.map(async (file) => {
        const newFile = new File({
          name: file.originalname,
          content: file.id, // Store the GridFS file ID
          user: userId,
        });
        await newFile.save();
      });

      await Promise.all(imagePromises);
      res.status(200).json({ message: "Files uploaded successfully", files });
    } catch (error) {
        console.log(error)
      console.error("Error saving file metadata:", error);
      res.status(500).json({ message: "Failed to save file metadata" });
    }
  });
};

// Controller function to fetch files
export const getFile = (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ message: "No file found" });
    }

    // Read file from GridFS
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
};
