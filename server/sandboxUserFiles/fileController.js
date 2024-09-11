import mongoose from "mongoose";
import File from "./fileModel.js";  // Import the File model
import { sandboxUpload } from "./gridFs.js";  // Import the GridFS storage configuration

export const uploadFile = async (req, res) => {
  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Determine the file type
    const fileType = determineFileType(req.file.mimetype, req.file.originalname);

    // Save the file metadata to the File model
    const file = new File({
      name: req.file.filename,
      user: mongoose.Types.ObjectId(req.user._id), // Assuming req.user._id contains the user ID
      type: fileType,
    });

    await file.save(); // Save the file metadata in MongoDB

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        id: file._id,
        name: file.name,
        type: file.type,
      },
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Error uploading file.", details: err.message });
  }
};

// Helper function to determine file type
const determineFileType = (mimetype, filename) => {
  // Image types: png, jpg, jpeg, gif, bmp, etc.
  if (mimetype.startsWith("image/") || /\.(png|jpg|jpeg|gif|bmp|svg)$/i.test(filename)) {
    return "image";
  }

  // Check for text files (.txt)
  if (mimetype === "text/plain" || /\.(txt)$/i.test(filename)) {
    return "text";
  }

  // Check for code files (.html, .css, .js)
  const extension = filename.split(".").pop().toLowerCase();
  if (["html", "css", "js"].includes(extension)) {
    return "code";
  }

  // Default to text if no other types match
  return "text";
};
