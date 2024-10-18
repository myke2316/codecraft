import mongoose from "mongoose";
import UserModel from "../../models/userModel.js";
import QuestionModel from "../../models/QuestionAndAnswerModels/questionsModel.js";

// Get all questions
export const getQuestions = async (req, res) => {
  try {
    const questions = await QuestionModel.find()
      .populate("author", "username profilePicture")
      .populate("answers.author", "username profilePicture")
      .populate("votes.user", "username");
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
      .populate("answers.author", "username profilePicture")
      .populate("votes.user", "username");
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
      status: "pending",
      votes: [],
      voteCount: 0,
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
  const { title, content, tags, codeBlocks, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      questionId,
      { title, content, tags, codeBlocks, status, updatedAt: Date.now() },
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
      status: "pending",
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
  const { content, codeBlocks, status } = req.body;
  try {
    const question = await QuestionModel.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.author.toString() !== req.body.authorId) {
      return res
        .status(403)
        .json({ message: "You can only update your own answers" });
    }

    answer.content = content;
    answer.codeBlocks = codeBlocks;
    answer.status = status || answer.status;
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

    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

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

    question.answers.pull(answerId);

    await question.save();
    res.json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an answer by ID
export const getAnswerById = async (req, res) => {
  const { questionId, answerId } = req.params;

  try {
    const question = await QuestionModel.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(answerId);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vote on a question
export const voteQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { userId, vote } = req.body;

  if (!mongoose.Types.ObjectId.isValid(questionId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid question ID or user ID" });
  }

  try {
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
   
    const existingVoteIndex = question.votes.findIndex(v => v.user.toString() === userId);

    if (existingVoteIndex !== -1) {
      if (vote === 0) {
        // Remove the vote if the new vote value is 0
        question.votes.splice(existingVoteIndex, 1);
      } else {
        // Update existing vote
        question.votes[existingVoteIndex].vote = vote;
      }
    } else if (vote !== 0) {
      // Add new vote only if it's not 0
      question.votes.push({ user: userId, vote });
    }

    // Recalculate voteCount
    question.voteCount = question.votes.reduce((sum, v) => sum + v.vote, 0);

    await question.save();
    res.status(200).json(question);
  } catch (error) {
    console.error("Error voting on question: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getQuestionVotes = async (req, res) => {
  const { questionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({voteCount: question.voteCount });
  } catch (error) {
    console.error("Error fetching question votes: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// Vote on an answer
export const voteAnswer = async (req, res) => {
  const { questionId, answerId } = req.params;
  const { userId, vote } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(questionId) ||
    !mongoose.Types.ObjectId.isValid(answerId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({ message: "Invalid question ID, answer ID, or user ID" });
  }

  try {
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Find if the user has already voted on this answer
    const existingVoteIndex = answer.votes.findIndex(v => v.user.toString() === userId);

    if (existingVoteIndex !== -1) {
      if (vote === 0) {
        // If vote is 0, remove the user's vote
        answer.votes.splice(existingVoteIndex, 1);
      } else {
        // Update the existing vote
        answer.votes[existingVoteIndex].vote = vote;
      }
    } else if (vote !== 0) {
      // If no existing vote and the vote is not 0, add a new vote
      answer.votes.push({ user: userId, vote });
    }

    // Recalculate voteCount for the answer
    answer.voteCount = answer.votes.reduce((sum, v) => sum + v.vote, 0);

    await question.save();
    res.status(200).json(answer);
  } catch (error) {
    console.error("Error voting on answer: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get votes for a specific answer
export const getAnswerVotes = async (req, res) => {
  const { questionId, answerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(questionId) || !mongoose.Types.ObjectId.isValid(answerId)) {
    return res.status(400).json({ message: "Invalid question ID or answer ID" });
  }

  try {
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.status(200).json({ voteCount: answer.voteCount });
  } catch (error) {
    console.error("Error fetching answer votes: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserVotes = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Find all questions where the user is the author
    const userQuestions = await QuestionModel.find({ author: userId });

    // Find all questions where the user has answered
    const questionsWithUserAnswers = await QuestionModel.find({ "answers.author": userId });

    let totalVotes = 0;

    // Calculate votes for user's questions
    userQuestions.forEach(question => {
      totalVotes += question.voteCount;
    });

    // Calculate votes for user's answers
    questionsWithUserAnswers.forEach(question => {
      question.answers.forEach(answer => {
        if (answer.author.toString() === userId) {
          totalVotes += answer.voteCount;
        }
      });
    });

    res.status(200).json({ userId, totalVotes });
  } catch (error) {
    console.error("Error fetching user votes: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};