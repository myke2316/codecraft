import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDeleteAnswerMutation,
  useVoteAnswerMutation,
  useGetAnswerVoteQuery,
} from "../questionService";
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
  Collapse,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useSelector } from "react-redux";
import { formatDate } from "../../../utils/formatDate";

const defaultProfilePicture =
  "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";

export default function AnswerItem({
  answer,
  currentUserId,
  isQuestionAuthor,
  currentQuestion,
  fetchQuestionData,
}) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userDetails);
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
  const [isMinimized, setIsMinimized] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  }, [answer, currentUserId]);

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
      refetchVotes();
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  if (answer.status === "denied" && answer.author._id !== user._id) {
    return null;
  }

  return (
    <Card
      className={`mb-6 transition-opacity duration-500 ${
        isFading ? "opacity-0" : "opacity-100"
      } shadow-md hover:shadow-lg`}
    >
      <CardContent className="p-4">
        <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <Box className="flex items-center mb-2 sm:mb-0">
            <Avatar
              src={answer.author.profilePicture || defaultProfilePicture}
              alt={answer.author.username}
              className="w-10 h-10 mr-3"
            />
            <Box>
              <Typography variant="subtitle1" className="font-semibold">
                {answer.author.username}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                Posted on {formatDate(answer.createdAt)}
              </Typography>
            </Box>
          </Box>
          <Box className="flex flex-wrap gap-2">
            {answer.status === "accepted" && (
              <Chip label="Admin Verified" color="success" size="small" />
            )}
            {answer.author._id === user._id && answer.status === "pending" && (
              <Chip label="Pending for verification" color="default" size="small" />
            )}
            {answer.author._id === user._id && answer.status === "denied" && (
              <Chip label="Denied by Admin" color="error" size="small" />
            )}
          </Box>
        </Box>
        <Box className="flex items-center justify-between mb-2">
          <Button
            startIcon={isMinimized ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            onClick={() => setIsMinimized(!isMinimized)}
            size="small"
            color="primary"
          >
            {isMinimized ? "Show Answer" : "Minimize Answer"}
          </Button>
        </Box>
        <Collapse in={!isMinimized}>
          <Typography variant="body1" className="mb-4 break-words">
            {answer.content}
          </Typography>
          {answer.codeBlocks.map((block, index) => (
            <Box key={index} className="mb-4">
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
                  fontSize: isMobile ? "0.8rem" : "1rem",
                }}
                wrapLines={true}
                wrapLongLines={true}
                showLineNumbers={true}
              >
                {formatCode(block.content)}
              </SyntaxHighlighter>
            </Box>
          ))}
          {answer.author._id === user._id && answer.status === "pending" && (
            <Alert severity="warning" className="mt-4">
              Answers are being monitored by an admin. Please be careful answering
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" className="mt-4">
              {successMessage}
            </Alert>
          )}
        </Collapse>
      </CardContent>
      <CardActions className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-3">
        <Box className="flex items-center space-x-2 mb-2 sm:mb-0">
          <IconButton
            onClick={() => handleVote(1)}
            disabled={isAnswerAuthor}
            color={userVote === 1 ? "primary" : "default"}
            size="small"
          >
            <ThumbUpIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" className="font-bold">
            {voteCount}
          </Typography>
          <IconButton
            onClick={() => handleVote(-1)}
            disabled={isAnswerAuthor}
            color={userVote === -1 ? "error" : "default"}
            size="small"
          >
            <ThumbDownIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box className="flex space-x-2">
          {isAnswerAuthor &&
            (answer.status === "pending" || answer.status === "accepted") && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                size={isMobile ? "small" : "medium"}
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
              size={isMobile ? "small" : "medium"}
            >
              Delete
            </Button>
          )}
        </Box>
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