import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Code as CodeIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useNavigate } from "react-router";
import {
  useVoteQuestionMutation,
  useGetQuestionVoteQuery,
  useGetAnswerVoteQuery,
} from "../questionService";

const QuestionContent = ({
  question,
  currentUserId,
  handleClickOpen,
  fetchQuestionData,
}) => {
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Added delete dialog state
  const isOwner = question.author._id === currentUserId;
  const navigate = useNavigate();

  const { data: voteData, refetch: refetchVotes } = useGetQuestionVoteQuery({
    questionId: question._id,
  });
  const isVoted = question?.votes?.some(
    (v) => v.user?._id.toString() === currentUserId
  );
  const voteStatus = question?.votes?.find(
    (v) => v.user?._id.toString() === currentUserId
  );

  useEffect(() => {
    if (voteData) {
      setVoteCount(voteData.voteCount);
    }
  }, [voteData]);
  const [voteQuestion] = useVoteQuestionMutation();

  useEffect(() => {
    setVoteCount(question.voteCount || 0);
    const userVote = question.votes?.find(
      (v) => v.user?._id.toString() === currentUserId
    );
    setUserVote(userVote ? userVote.vote : 0);
  }, [question]);
  const handleVote = async (vote) => {
    if (isOwner) return;

    try {
      const newVote = userVote === vote ? 0 : vote;
      const result = await voteQuestion({
        questionId: question._id,
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
  const onBack = () => {
    navigate(`/qna/${currentUserId}`);
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(true); // Open delete dialog
  };

  const confirmDelete = async () => {
    try {
      await deleteQuestion(question._id).unwrap();
      setDeleteDialogOpen(false);
      navigate(-1); // Redirect back after deletion
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const handleEdit = () => {
    navigate(`/edit-question/${question._id}`, { state: { question } });
  };

  return (
    <Card
      elevation={3}
      className="mb-8 overflow-hidden transition-shadow duration-300 hover:shadow-lg"
    >
      <CardHeader
        avatar={
          <Avatar src={question.author.avatar} className="bg-blue-500">
            {!question.author.avatar && <PersonIcon />}
          </Avatar>
        }
        title={
          <Box className="flex items-center justify-between">
            <Typography
              variant="subtitle1"
              className="font-semibold text-foreground" // Updated class name
            >
              {question.author.username}
            </Typography>
            {isOwner && (
              <Box>
                <Tooltip title="Edit question">
                  <IconButton
                    onClick={handleEdit}
                    size="small"
                    className="mr-1"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete question">
                  <IconButton onClick={handleDelete} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        }
        subheader={
          <Box className="flex items-center text-gray-500">
            <AccessTimeIcon fontSize="small" className="mr-1" />
            <Typography variant="caption">
              Asked on {new Date(question.createdAt).toLocaleString()}
            </Typography>
          </Box>
        }
        className="bg-background" // Updated class name
      />
      <CardContent className="p-6">
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          className="font-bold text-foreground mb-4" // Updated class name
        >
          {question.title}
        </Typography>
        <Typography
          variant="body1"
          className="mb-6 text-foreground whitespace-pre-line leading-relaxed" // Updated class name
        >
          {question.content}
        </Typography>

        {question.codeBlocks.map((block, index) => (
          <Card
            key={index}
            variant="outlined"
            className="mb-6 overflow-hidden border-gray-200"
          >
            <CardHeader
              avatar={<CodeIcon className="text-gray-500" />}
              title={
                <Typography
                  variant="subtitle2"
                  className="font-medium text-foreground" // Updated class name
                >
                  {block.language.toUpperCase()}
                </Typography>
              }
              className="bg-background py-2 px-4" // Updated class name
            />
            <SyntaxHighlighter
              language={block.language}
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.9rem" }}
            >
              {block.content}
            </SyntaxHighlighter>
          </Card>
        ))}

        <Box className="mt-6 flex flex-wrap gap-2">
          {question.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag.toUpperCase()}
              variant="outlined"
              size="small"
              className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer" // Updated class name
            />
          ))}
        </Box>
      </CardContent>

      <Divider />

      <CardActions className="bg-background p-4 flex justify-between items-center flex-wrap">
        {" "}
        {/* Updated class name */}
        <Box className="flex items-center space-x-2 mb-2 sm:mb-0">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
            size="small"
          >
            Add Answer
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={fetchQuestionData}
            size="small"
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            size="small"
          >
            Back
          </Button>
        </Box>
        <Box className="flex items-center">
          {isOwner && (
            <Tooltip title="You cannot vote on your own question" arrow>
              <Typography
                variant="caption"
                className="italic bg-warning text-warning-foreground px-2 py-1 rounded" // Updated class name
              >
                Voting disabled for own question
              </Typography>
            </Tooltip>
          )}
          <Box className="flex items-center">
            <IconButton
              onClick={() => handleVote(-1)}
              color={userVote === -1 ? "error" : "default"}
              size="small"
              disabled={isOwner}
              className="hover:bg-red-100"
            >
              <ThumbDownIcon fontSize="small" />
            </IconButton>
            <Typography
              variant="body2"
              className="mx-2 font-bold min-w-[20px] text-center"
            >
              {voteCount}
            </Typography>
            <IconButton
              onClick={() => handleVote(1)}
              color={userVote === 1 ? "primary" : "default"}
              size="small"
              disabled={isOwner}
              className="hover:bg-green-100"
            >
              <ThumbUpIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardActions>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Question"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this question? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default QuestionContent;
