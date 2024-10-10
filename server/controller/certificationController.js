import asyncHandler from "express-async-handler";
import CertificateModel from "../models/certificationModel.js";
import ClassModel from "../models/classModel.js";
import mongoose from "mongoose";
import {
  signaturesUpload,
  signatureBucket,
} from "../sandboxUserFiles/gridFs.js";
import SignatureModel from "../models/signatureModel.js";

const createCertificate = asyncHandler(async (req, res) => {
  const { studentId, classId, dateFinished } = req.body;

  // Check if the certificate already exists for the student in this class
  const existingCertificate = await CertificateModel.findOne({
    studentId,
    classId,
  });

  if (existingCertificate) {
    res.status(400);
    throw new Error("Certificate already exists for this student in the class");
  }

  // Create a new certificate
  const certificate = new CertificateModel({
    studentId,
    classId,
    dateFinished,
  });

  const createdCertificate = await certificate.save();

  res.status(201).json(createdCertificate);
});

const updateCertificateByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { dateFinished, totalPoints, classId } = req.body;

  const certificate = await CertificateModel.findOne({
    studentId,
    classId,
  });

  if (!certificate) {
    res.status(404);
    throw new Error("Certificate not found");
  }

  certificate.dateFinished = dateFinished || certificate.dateFinished;
  certificate.totalPoints = totalPoints || certificate.totalPoints;

  const updatedCertificate = await certificate.save();

  res.status(200).json(updatedCertificate);
});

const createSignature = asyncHandler(async (req, res) => {
  const { userId, name, role } = req.body;
  const file = req.file; // Get the uploaded file

  // Ensure required fields
  if (!userId || !name || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate the role
  if (role !== "teacher" && role !== "admin") {
    return res
      .status(400)
      .json({ message: 'Invalid role. Must be either "teacher" or "admin"' });
  }

  // Validate file type
  if (!file || !file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "Please upload an image file" });
  }

  try {
    // Check if a signature already exists for this user
    let existingSignature = await SignatureModel.findOne({ userId });

    if (existingSignature) {
      // Update the existing signature
      existingSignature.signature = file.id;
      existingSignature.name = name;
      existingSignature.role = role;

      const updatedSignature = await existingSignature.save();
      res
        .status(200)
        .json({
          message: "Signature updated successfully",
          signature: updatedSignature,
        });
    } else {
      // Create a new signature record
      const newSignature = new SignatureModel({
        signature: file.id,
        userId,
        name,
        role,
      });

      const savedSignature = await newSignature.save();
      res
        .status(201)
        .json({
          message: "Signature created successfully",
          signature: savedSignature,
        });
    }
  } catch (error) {
    console.error("Error creating/updating signature: ", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const getSignatureForStudent = asyncHandler(async (req, res) => {
  const { studentId, classId } = req.params;

  try {
    // Find the class and populate the teacher field
    const classData = await ClassModel.findById(classId).populate('teacher');
    
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Get the teacher's signature
    const teacherSignature = await SignatureModel.findOne({ userId: classData.teacher._id, role: 'teacher' });

    if (!teacherSignature) {
      return res.status(404).json({ message: "Teacher signature not found" });
    }

    // Get the admin signature (assuming there's only one admin signature)
    const adminSignature = await SignatureModel.findOne({ role: 'admin' });

    if (!adminSignature) {
      return res.status(404).json({ message: "Admin signature not found" });
    }

    // Return both signatures
    res.status(200).json({
      teacherSignature: {
        id: teacherSignature._id,
        name: teacherSignature.name,
        signatureId: teacherSignature.signature
      },
      adminSignature: {
        id: adminSignature._id,
        name: adminSignature.name,
        signatureId: adminSignature.signature
      }
    });

  } catch (error) {
    console.error("Error fetching signatures:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
const getSignature = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const signature = await SignatureModel.findOne({ userId });

    if (!signature) {
      return res
        .status(404)
        .json({ message: "Signature not found for this user" });
    }

    res.status(200).json({
      message: "Signature found",
      signature: {
        id: signature._id,
        userId: signature.userId,
        name: signature.name,
        role: signature.role,
        signatureId: signature.signature, // This is the file ID in GridFS
      },
    });
  } catch (error) {
    console.error("Error fetching signature:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
const getSignatureImage = asyncHandler(async (req, res) => {
  const { signatureId } = req.params;

  try {
    // Find the file metadata to determine the content type
    const files = await signatureBucket
      .find({ _id: new mongoose.Types.ObjectId(signatureId) })
      .toArray();

    if (files && files.length > 0) {
      // Set the content type before streaming the file
      res.setHeader("Content-Type", files[0].contentType);

      // Create a read stream for the file
      const downloadStream = signatureBucket.openDownloadStream(
        new mongoose.Types.ObjectId(signatureId)
      );

      // Check if the file exists
      downloadStream.on("error", () => {
        res.status(404).json({ message: "Signature image not found" });
      });

      // Pipe the download stream to the response
      downloadStream.pipe(res);
    } else {
      res.status(404).json({ message: "Signature image not found" });
    }
  } catch (error) {
    console.error("Error retrieving signature image:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
const updateSignature = asyncHandler(async (req, res) => {
  const { userId, name, role } = req.body;
  const file = req.file; // File is optional

  try {
    // Validate userId, name, role
    if (!userId || !name || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (role !== "teacher" && role !== "admin") {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Find the existing signature for the user
    const existingSignature = await SignatureModel.findOne({ userId, role });

    if (!existingSignature) {
      return res.status(404).json({ message: "Signature not found" });
    }

    // Delete the old signature image from GridFS if it exists
    if (existingSignature.signature) {
      try {
        await signatureBucket.delete(new mongoose.Types.ObjectId(existingSignature.signature));
        console.log("Old signature image deleted successfully");
      } catch (error) {
        console.error("Error deleting old signature image:", error);
        // We'll continue with the update even if deletion fails
      }
    }

    // Update the signature record with the new details
    existingSignature.name = name;
    if (file) {
      existingSignature.signature = file.id; // Update with the new file's ObjectId
    }

    await existingSignature.save();

    return res.status(200).json({
      message: "Signature updated successfully",
      signature: existingSignature,
    });
  } catch (error) {
    console.error("Error updating signature:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
export {
  createCertificate,getSignatureForStudent,
  createSignature,
  getSignature,
  getSignatureImage,
  updateCertificateByStudent,
  updateSignature,
};
