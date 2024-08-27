import mongoose from "mongoose";
const ImageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Associate image with user
});
const ImageModel = mongoose.model("Image", ImageSchema);
export default ImageModel;
