import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteQuestionMutation } from "../questionService";
import ConfirmationDialog from "./ConfirmationDialog";
import { useSelector } from "react-redux";

const defaultProfilePicture =
  "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";

const QuestionHeader = ({ question, currentUserId }) => {
  const navigate = useNavigate();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check if the current user is the author of the question
  const isAuthor = question.author._id === currentUserId;
  const userId = useSelector((state) => state.user.userDetails._id);

  const handleEdit = () => {
    navigate(`/edit-question/${question._id}`, { state: { question } });
  };

  const handleDelete = async () => {
    try {
      await deleteQuestion(question._id).unwrap();
      navigate(-1); // Redirect back after deletion
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  return (
    <div className="flex items-center mb-4">
      <img
        src={question.author.profilePicture || defaultProfilePicture}
        alt={question.author.name}
        className="w-10 h-10 rounded-full mr-2"
      />
      <span className="mr-4">{question.author.username}</span>
      <h1 className="text-3xl font-bold">{question.title}</h1>
      <div className="ml-auto flex items-center space-x-2">
        <button
          onClick={() => navigate(`/qna/${userId}`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <span className="material-icons mr-2">arrow_back</span>
          Back
        </button>
        {isAuthor && (
          <>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700 flex items-center"
            >
              <span className="material-icons mr-2">edit</span>
              Edit
            </button>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 flex items-center"
            >
              <span className="material-icons mr-2">delete</span>
              Delete
            </button>
          </>
        )}
      </div>
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this question?"
      />
    </div>
  );
};

export default QuestionHeader;
