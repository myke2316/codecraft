import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    className: { type: String, required: true },
    inviteCode: { type: String, unique: true, required: true },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const ClassModel = mongoose.model("Class", classSchema);
export default ClassModel;
