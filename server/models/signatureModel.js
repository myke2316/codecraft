import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema(
  {
    signature: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    name: {
      type: String,
      required: true,
    },
role:{
    type:String,required: true
}
  },
  { timestamps: false }
);

const SignatureModel = mongoose.model("Signature", signatureSchema);
export default SignatureModel;
