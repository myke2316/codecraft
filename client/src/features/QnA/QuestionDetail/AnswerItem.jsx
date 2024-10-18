import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteAnswerMutation, useVoteAnswerMutation, useGetAnswerVoteQuery } from "../questionService";
import ConfirmationDialog from "./ConfirmationDialog";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Chip,
  Alert,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const defaultProfilePicture =
  "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";

export default function AnswerItem({ answer, currentUserId, isQuestionAuthor, currentQuestion, fetchQuestionData }) {
  const navigate = useNavigate();
  const [deleteAnswer] = useDeleteAnswerMutation();
  const [voteAnswer] = useVoteAnswerMutation();
  const { data: voteData, refetch: refetchVotes } = useGetAnswerVoteQuery({
    questionId: currentQuestion._id,
    answerId: answer._id,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isFading, setIsFading] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState(0);

  const isAnswerAuthor = answer.author._id === currentUserId;

  useEffect(() => {
    if (voteData) {
      setVoteCount(voteData.voteCount);
    }
  }, [voteData]);
  useEffect(() => {
    setVoteCount(answer.voteCount || 0);
    const userVote = answer.votes?.find(
      (v) => v.user.toString() === currentUserId
    );
    setUserVote(userVote ? userVote.vote : 0);
  }, [answer]);

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
        authorId: currentQuestion.author._id,
      }).unwrap();
      setSuccessMessage("Successfully deleted the answer.");
      setIsFading(true);
      fetchQuestionData();
    } catch (error) {
      console.error("Failed to delete answer:", error);
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleVote = async (vote) => {
    if (isAnswerAuthor) return;

    try {
      const newVote = userVote === vote ? 0 : vote;
      const result = await voteAnswer({
        questionId: currentQuestion._id,
        answerId: answer._id,
        userId: currentUserId,
        vote: newVote,
      }).unwrap();

      setVoteCount(result.voteCount);
      setUserVote(newVote);
      console.log("NEW VOTE:" ,newVote)
      console.log(userVote , vote)
      refetchVotes();
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };


  return (
    <Card
      className={`mb-6 transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      } shadow-md hover:shadow-lg`}
    >
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <Avatar
            src={answer.author.profilePicture || defaultProfilePicture}
            alt={answer.author.username}
            className="w-12 h-12"
          />
          <Typography variant="h6" component="div" className="font-semibold">
            {answer.author.username}
          </Typography>
        </div>
        <Typography variant="body1" className="mb-4 break-words">
          {answer.content}
        </Typography>
        {answer.codeBlocks.map((block, index) => (
          <div key={index} className="mb-4">
            <Chip
              label={block.language.toUpperCase()}
              color="primary"
              size="small"
              className="mb-2"
            />
            <SyntaxHighlighter
              language={block.language}
              style={atomDark}
              customStyle={{
                borderRadius: "0.375rem",
                padding: "1rem",
              }}
              wrapLines={true}
              wrapLongLines={true}
              showLineNumbers={true}
            >
              {formatCode(block.content)}
            </SyntaxHighlighter>
          </div>
        ))}
        {successMessage && (
          <Alert severity="success" className="mt-4">
            {successMessage}
          </Alert>
        )}
      </CardContent>
      <CardActions className="flex justify-between items-center bg-gray-50 p-2">
        <div className="flex items-center space-x-2">
          <IconButton
            onClick={() => handleVote(1)}
            disabled={isAnswerAuthor}
            color={userVote === 1 ? "primary" : "default"}
          >
            <ThumbUpIcon />
          </IconButton>
          <Typography variant="body2" className="font-bold">
            {voteCount}
          </Typography>
          <IconButton
            onClick={() => handleVote(-1)}
            disabled={isAnswerAuthor}
            color={userVote === -1 ? "error" : "default"}
          >
            <ThumbDownIcon />
          </IconButton>
        </div>
        <div className="flex space-x-2">
          {isAnswerAuthor && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
            >
              Edit
            </Button>
          )}
          {(isAnswerAuthor || isQuestionAuthor) && (
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => setIsDialogOpen(true)}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
      </CardActions>
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this answer?"
      />
    </Card>
  );
}

function formatCode(code) {
  return code
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}