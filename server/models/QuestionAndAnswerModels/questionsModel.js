import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CodeBlockSchema = new Schema({
  language: {
    type: String,
    enum: ["html", "css", "javascript", "php"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const AnswerSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  codeBlocks: [CodeBlockSchema],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "denied"],
    default: "pending",
  },
  votes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      vote: {
        type: Number,
        enum: [-1, 0,1], 
      },
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
});

const QuestionSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    // enum: ["html", "css", "javascript", "php"],
    required: true,
  },
  codeBlocks: [CodeBlockSchema],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [AnswerSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "denied"],
    default: "pending",
  },
  votes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      vote: {
        type: Number,
        enum: [-1,0, 1],
      },
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
});

const QuestionModel = model("Question", QuestionSchema);

export default QuestionModel;
