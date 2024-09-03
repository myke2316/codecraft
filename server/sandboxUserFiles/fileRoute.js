import express from "express";
import File from "./fileModel.js"; // Update with the correct path to your File model
import mongoose from "mongoose";
import { gfs, upload } from "./gridFs.js";
import { uploadFiles } from "./fileController.js";

const router = express.Router();

// Upload files
router.post("/upload", uploadFiles);
// Get user images
router.get("/user-images/:userId", async (req, res) => {
  try {
    const userId = req.params.userId; // Get userId from route params
    const files = await File.find({ user: userId });
    
    if (!files) return res.status(404).json({ message: "No files found for user" });

    const images = files.map((file) => ({
      imageName: file.name,
      data: file._id, // File ID to be used for retrieval
    }));

    res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching user images:", error);
    res.status(500).json({ message: "Failed to fetch user images" });
  }
});

// Save user data (files and contents)
router.post("/save-user-data", async (req, res) => {
  try {
    const { savedFiles, fileContents, images, userId } = req.body; // Get userId from request body

    const formattedFileContents = Object.keys(fileContents).map((fileName) => ({
      fileName,
      content: fileContents[fileName],
    }));

    const formattedImages = Object.keys(images).map((imageName) => ({
      imageName,
      data: images[imageName],
    }));

    await UserModel.findByIdAndUpdate(userId, {
      savedFiles,
      fileContents: formattedFileContents,
      images: formattedImages,
    });

    res.status(200).json({ message: "User data saved successfully" });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ message: "Failed to save user data" });
  }
});

// Retrieve image by ID
router.get("/images/:id", async (req, res) => {
  try {
    if (!gfs) {
      console.error("GridFS not initialized");
      return res.status(500).send("GridFS not initialized");
    }
    const file = await gfs.files.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
    });
    if (!file) {
      console.error("Image not found");
      return res.status(404).send("Image not found");
    }

    const readstream = gfs.openDownloadStream(file._id);
    res.set("Content-Type", file.contentType); // Set the correct content type
    readstream.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Failed to fetch image");
  }
});

// Retrieve image by filename
router.get("/images/filename/:filename", async (req, res) => {
  try {
    if (!gfs) {
      return res.status(500).send("GridFS not initialized");
    }

    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (!file) {
      return res.status(404).send("Image not found");
    }

    const readstream = gfs.openDownloadStreamByName(file.filename);
    res.set("Content-Type", file.contentType); // Set content type like 'image/png'
    readstream.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Failed to fetch image");
  }
});

// Save user files
router.post("/save-user-files", async (req, res) => {
  try {
    const { files, userId } = req.body; // Get userId from request body

    // Remove old files
    await File.deleteMany({ user: userId });

    const savedFiles = await Promise.all(
      files.map((file) =>
        new File({
          name: file.name,
          content: file.content,
          user: userId,
        }).save()
      )
    );

    res.status(200).json({ message: "Files saved successfully" });
  } catch (error) {
    console.error("Error saving files:", error);
    res.status(500).json({ message: "Failed to save files" });
  }
});

// Get user files
router.get("/get-user-files/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const files = await File.find({ user: userId });
    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Failed to fetch files" });
  }
});

// Get files for current user
router.get("/get-files/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const files = await File.find({ user: userId });

    if (!files) {
      return res.status(404).json({ message: "No files found for user" });
    }

    const responseFiles = files.map((file) => ({
      name: file.name,
      content: file.content.toString(), // Convert buffer to string
    }));

    res.json(responseFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export { router as fileRoutes };
