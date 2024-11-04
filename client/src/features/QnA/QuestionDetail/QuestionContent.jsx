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
  useMediaQuery,
  useTheme,
  Alert,
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
  useDeleteQuestionMutation,
} from "../questionService";
import { toast } from "react-toastify";

const QuestionContent = ({
  question,
  currentUserId,
  handleClickOpen,
  fetchQuestionData,
}) => {
  const [voteCount, setVoteCount] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isOwner = question.author._id === currentUserId;
  const navigate = useNavigate();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const { data: voteData, refetch: refetchVotes } = useGetQuestionVoteQuery({
    questionId: question._id,
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  }, [question, currentUserId]);

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
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteQuestion(question._id).unwrap();
      setDeleteDialogOpen(false);
      toast.success("Successfully Deleted Question");
      navigate(`/qna/${currentUserId}`);
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const handleEdit = () => {
    navigate(`/edit-question/${question._id}`, { state: { question } });
  };

  return (
    <Box className="relative w-full max-w-8xl mb-8 mx-auto">
      <IconButton
        onClick={onBack}
        className=""
        color="#6e61ab"
        aria-label="back"
      >
        <ArrowBackIcon />
      </IconButton>
      <Card className="bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow duration-300">
        {question.status === "pending" && (
          <Alert severity="warning">Question waiting for admin approval.</Alert>
        )}
        {console.log(question)}
        {question.status === "denied" && (
          <Alert severity="error">
            Question is denied and will be automatically deleted, please delete
            this question.
          </Alert>
        )}
        <CardHeader
          avatar={
            <Avatar
              src={question.author.avatar}
              className="bg-primary text-primary-foreground"
            >
              {!question.author.avatar && <PersonIcon />}
            </Avatar>
          }
          title={
            <Box className="flex items-center justify-between">
              <Typography variant="subtitle1" className="font-semibold">
                {question.author.username}
              </Typography>
              {isOwner && (
                <Box>
                  <Tooltip title="Edit question">
                    <IconButton
                      onClick={handleEdit}
                      size="small"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete question">
                    <IconButton
                      onClick={handleDelete}
                      size="small"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          }
          subheader={
            <Box className="flex items-center text-muted-foreground">
              <AccessTimeIcon fontSize="small" className="mr-1" />
              <Typography variant="caption">
                Asked on {new Date(question.createdAt).toLocaleString()}
              </Typography>
            </Box>
          }
        />
        <CardContent className="p-6">
          <Typography variant="h5" component="h1" className="font-bold mb-4">
            {question.title}
          </Typography>
          <Typography
            variant="body1"
            className="mb-6 whitespace-pre-line leading-relaxed"
          >
            {question.content}
          </Typography>

          {question.codeBlocks.map((block, index) => (
            <Card
              key={index}
              variant="outlined"
              className="mb-6 overflow-hidden border-border"
            >
              <CardHeader
                avatar={<CodeIcon className="text-muted-foreground" />}
                title={
                  <Typography variant="subtitle2" className="font-medium">
                    {block.language.toUpperCase()}
                  </Typography>
                }
                className="py-2 px-4 bg-muted"
              />
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <SyntaxHighlighter
                  language={block.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    fontSize: "0.9rem",
                  }}
                >
                  {block.content}
                </SyntaxHighlighter>
              </div>
            </Card>
          ))}

          <Box className="mt-6 flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag.toUpperCase()}
                variant="outlined"
                size="small"
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
              />
            ))}
          </Box>
        </CardContent>

        <Divider />

        <CardActions className="p-4 flex flex-col sm:flex-row justify-between items-center">
          <Box className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4 sm:mb-0">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleClickOpen}
              size={isMobile ? "small" : "medium"}
            >
              Add Answer
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={fetchQuestionData}
              size={isMobile ? "small" : "medium"}
            >
              Refresh
            </Button>
          </Box>
          <Box className="flex items-center">
       
              <Box className="flex items-center">
                <IconButton
                  onClick={() => handleVote(-1)}
                  color={userVote === -1 ? "error" : "default"}
                  size="small"
                  className="hover:bg-destructive/10"
                  disabled={isOwner}
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
                  className="hover:bg-primary/10" 
                  disabled={isOwner}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
              </Box>
            
          </Box>
        </CardActions>
      </Card>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Question</DialogTitle>
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
    </Box>
  );
};

export default QuestionContent;
