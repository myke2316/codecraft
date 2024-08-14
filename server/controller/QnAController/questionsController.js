import mongoose from "mongoose";

import UserModel from "../../models/userModel.js";
import QuestionModel from "../../models/QuestionAndAnswerModels/questionsModel.js";

// Get all questions
export const getQuestions = async (req, res) => {
  try {
    const questions = await QuestionModel.find()
      .populate("author", "username profilePicture")
      .populate("answers.author", "username profilePicture");
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a single question by ID
export const getQuestionById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    const question = await QuestionModel.findById(id)
      .populate("author", "username profilePicture")
      .populate("answers.author", "username profilePicture");
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error("Error fetching question: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new question
export const createQuestion = async (req, res) => {
  const { title, content, tags, codeBlocks, authorId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return res.status(400).json({ message: "Invalid author ID" });
  }

  try {
    const author = await UserModel.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const newQuestion = new QuestionModel({
      title,
      content,
      tags,
      codeBlocks,
      author: authorId,
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Error creating question: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update an existing question
export const updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { title, content, tags, codeBlocks } = req.body;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      questionId,
      { title, content, tags, codeBlocks, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add an answer to a question
export const addAnswer = async (req, res) => {
  const { questionId } = req.params;
  const { content, codeBlocks, authorId } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(questionId) ||
    !mongoose.Types.ObjectId.isValid(authorId)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid question ID or author ID" });
  }

  try {
    const author = await UserModel.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const newAnswer = {
      content,
      codeBlocks,
      author: authorId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    question.answers.push(newAnswer);
    await question.save();

    res.status(201).json(question);
  } catch (error) {
    console.error("Error adding answer: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to update an answer
export const updateAnswer = async (req, res) => {
  const { content, codeBlocks } = req.body;
  try {
    const question = await QuestionModel.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Check if the current user is the author of the answer
    if (answer.author.toString() !== req.body.authorId) {
      return res
        .status(403)
        .json({ message: "You can only update your own answers" });
    }

    answer.content = content;
    answer.codeBlocks = codeBlocks;
    answer.updatedAt = Date.now();

    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a question
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    const question = await QuestionModel.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete an answer
export const deleteAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const { authorId } = req.body;

    // Find the question by ID
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if the answer exists in the question's answers array
    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Check if the current user is the author of the answer or the question
    if (
      answer.author.toString() !== authorId &&
      question.author.toString() !== authorId
    ) {
      return res
        .status(403)
        .json({
          message:
            "You can only delete your own answers or answers to your own question",
        });
    }

    // Remove the answer from the answers array
    question.answers.pull(answerId);

    // Save the updated question
    await question.save();
    res.json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnswerById = async (req, res) => {
  const { questionId, answerId } = req.params;
  
  try {
    // Find the question by ID
    const question = await QuestionModel.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Find the answer by ID within the question
    const answer = question.answers.id(answerId);
    
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Return the answer details
    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
