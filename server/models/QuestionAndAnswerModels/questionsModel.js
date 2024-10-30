import mongoose from "mongoose";
import cron from 'node-cron'
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



// Middleware to schedule deletion for denied questions or answers
QuestionSchema.post("save", function (doc) {
  if (doc.status === "denied") {
    scheduleDeletion(doc._id, "Question");
  }

  doc.answers.forEach((answer) => {
    if (answer.status === "denied") {
      scheduleDeletion(answer._id, "Answer");
    }
  });
});

// Cron job to delete questions and answers in "denied" status with updatedAt older than 10 seconds
cron.schedule("0 * * * *", async () => {  // Runs every hour
  const expirationTime = new Date(Date.now() - 10 * 60 * 60 * 1000); // 10 hours ago

  try {
    // Delete denied questions
    const deletedQuestions = await QuestionModel.deleteMany({
      status: "denied",
      updatedAt: { $lte: expirationTime },
    });

    // Update questions by pulling answers where status is "denied" and updatedAt is older than 10 hours
    const updatedQuestions = await QuestionModel.updateMany(
      { "answers.status": "denied", "answers.updatedAt": { $lte: expirationTime } },
      { $pull: { answers: { status: "denied", updatedAt: { $lte: expirationTime } } } }
    );

    // Log results for verification
    console.log(`Cron job ran: Deleted questions:`, deletedQuestions.deletedCount);
    console.log(`Cron job ran: Questions updated by removing denied answers:`, updatedQuestions.modifiedCount);
  } catch (error) {
    console.error("Error running cron job for deletion:", error);
  }
});



export default QuestionModel;
