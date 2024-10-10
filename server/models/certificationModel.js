import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencing the User model for students
      required: false,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // Referencing the User model for students
      required: false,
    },
    certificateId: {
      type: String,
      required: true,
      default: () => uuidv4(), // Generating a unique ID for each certificate
    },
    dateFinished: {
      type: Date,
      required: false,
    },
  
  },
  { timestamps: false }
);

const CertificateModel = mongoose.model("Certificate", certificateSchema);
export default CertificateModel;
