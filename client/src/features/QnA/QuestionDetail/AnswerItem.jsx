import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteAnswerMutation } from "../questionService"; // Adjust the import path as needed
import ConfirmationDialog from "./ConfirmationDialog";

const defaultProfilePicture =
  "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";

const AnswerItem = ({
  answer,
  currentUserId,
  isQuestionAuthor,
  currentQuestion,
}) => {
  const navigate = useNavigate();
  const [deleteAnswer] = useDeleteAnswerMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [isFading, setIsFading] = useState(false); // State for fade effect

  const isAnswerAuthor = answer.author._id === currentUserId;

  const handleEdit = () => {
    navigate(`/edit-answer/${currentQuestion._id}/${answer._id}`, {
      state: { answer },
    });
  };

  const handleDelete = async () => {
    try {
      await deleteAnswer({
        answerId: answer._id,
        questionId: currentQuestion._id,
        authorId: currentQuestion.author._id, // Ensure you pass the current user ID
      }).unwrap();
      setSuccessMessage("Successfully deleted the answer."); // Set success message
      setIsFading(true); // Trigger fade-out effect

      // Set a timeout to reload the page after the fade-out transition
      setTimeout(() => {
        window.location.reload(); // Reload the page
      }, 500); // Match the duration of your fade-out transition
    } catch (error) {
      console.error("Failed to delete answer:", error);
    } finally {
      setIsDialogOpen(false); // Close the dialog after action
    }
  };

  return (
    <li
      className={`mb-4 p-4 border border-gray-200 rounded shadow-sm transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center">
        <img
          src={answer.author.profilePicture || defaultProfilePicture}
          alt={answer.author.username}
          className="w-8 h-8 rounded-full mr-2"
        />
        <div className="text-xl font-semibold">{answer.author.username}</div>
      </div>
      <div className="text-lg mt-2">
        <p className="break-words">{answer.content}</p>
      </div>
      {answer.codeBlocks.map((block, index) => (
        <div key={index} className="mt-2">
          <div className="text-sm font-medium">
            {block.language.toUpperCase()}
          </div>
          <pre className="p-2 bg-gray-100 rounded overflow-x-auto whitespace-pre-wrap">
            {block.content}
          </pre>
        </div>
      ))}
      {/* Show edit and delete buttons based on author conditions */}
      {(isAnswerAuthor || isQuestionAuthor) && (
        <div className="mt-4 flex space-x-2">
          {isAnswerAuthor && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700"
            >
              Edit
            </button>
          )}
          {(isAnswerAuthor || isQuestionAuthor) && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      )}
      {/* Success message */}
      {successMessage && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 border border-green-300 rounded">
          {successMessage}
        </div>
      )}
      {/* Confirmation dialog for deletion */}
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this answer?"
      />
    </li>
  );
};

export default AnswerItem;
