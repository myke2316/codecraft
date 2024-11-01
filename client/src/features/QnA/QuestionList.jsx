import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useFetchQuestionsMutation,
  useDeleteQuestionMutation,
} from "./questionService";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  List,
  Chip,
  Avatar,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  ArrowUpward as UpvoteIcon,
  QuestionAnswer as AnswerIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const QuestionList = ({ userId }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [fetchQuestions, { isLoading: isLoadingFetchQuestions }] =
    useFetchQuestionsMutation();

  const [deleteQuestion] = useDeleteQuestionMutation();

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await fetchQuestions();
      setQuestions([...data.data]);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleTagChange = (event) => {
    setSelectedTags(event.target.value);
  };

  const handleRefresh = () => {
    loadQuestions();
  };

  const handleDeleteQuestion = async (questionId, event) => {
    event.stopPropagation();
    try {
      await deleteQuestion(questionId);
      setQuestions((prevQuestions) =>
        prevQuestions.filter((question) => question._id !== questionId)
      );
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  };

  const handleQuestionClick = (id) => {
    navigate(`question/${id}`);
  };

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions.filter(
      (question) =>
        question.status === "accepted" || question.author._id === userId
    );

    if (selectedTags.length > 0) {
      filtered = filtered.filter((question) =>
        selectedTags.every((tag) => question.tags.includes(tag))
      );
    }

    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (question) =>
          question.title.toLowerCase().includes(lowercaseQuery) ||
          question.content.toLowerCase().includes(lowercaseQuery) ||
          question.tags.some((tag) =>
            tag.toLowerCase().includes(lowercaseQuery)
          )
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (question) =>
          question.status === statusFilter &&
          (question.status === "accepted" || question.author._id === userId)
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "upvotes") {
        return (b.voteCount || 0) - (a.voteCount || 0);
      }
      return 0;
    });
  }, [questions, selectedTags, sortBy, searchQuery, statusFilter, userId]);

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error)
    return (
      <Typography color="error">
        Error loading questions: {error.message}
      </Typography>
    );

  return (
    <Box className="max-w-8xl mx-auto p-4">
      <Paper elevation={3} className="p-6 bg-gray-50">
        <Box className="flex justify-between items-center mb-6 flex-wrap">
          <Typography variant="h4" className="font-bold text-gray-800">
            Questions
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoadingFetchQuestions}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Refresh
          </Button>
        </Box>
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="upvotes">Upvotes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="denied">Denied</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Filter by Languages</InputLabel>
              <Select
                multiple
                value={selectedTags}
                onChange={handleTagChange}
                label="Filter by Tags"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {["html", "css", "javascript", "php"].map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search questions or tags"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
              }}
            />
          </Grid>
        </Grid>
        <List>
          {filteredAndSortedQuestions.map((question) => {
            const isOwner = question.author._id === userId;
            const isAccepted = question.status === "accepted";
            const isPending = question.status === "pending";
            const isDenied = question.status === "denied";

            return (
              <Card
                key={question._id}
                className={`mb-4 cursor-pointer transition-all duration-300 transform hover:scale-102 hover:shadow-lg ${
                  isPending ? "opacity-70" : ""
                } ${isDenied ? "opacity-70 bg-red-50" : ""}`}
                onClick={() => handleQuestionClick(question._id)}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    {/* Upvote and Answers Icons */}
                    <Grid
                      item
                      xs={3}
                      sm={2}
                      md={1}
                      className="flex flex-col items-center justify-center"
                    >
                      <Tooltip title="Upvotes">
                        <Box className="flex flex-col items-center">
                          <UpvoteIcon className="text-gray-500 mb-1" />
                          <Typography variant="h6" className="font-bold">
                            {question.voteCount || 0}
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Answers">
                        <Box className="flex flex-col items-center mt-2">
                          <AnswerIcon className="text-gray-500 mb-1" />
                          <Typography variant="h6" className="font-bold">
                            {question.answers?.length || 0}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>

                    {/* Question Details */}
                    <Grid item xs={9} sm={10} md={11}>
                      <Typography
                        variant="h6"
                        className="font-bold mb-2 text-blue-600 hover:text-blue-800"
                      >
                        {question.title}
                      </Typography>
                      <Box className="flex flex-wrap gap-1 mb-3">
                        {question.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag.toUpperCase()}
                            size="small"
                            className="bg-blue-100 text-blue-800"
                          />
                        ))}
                      </Box>
                      <Box className="flex items-center justify-between">
                        <Box className="flex items-center">
                          <Avatar
                            alt={question.author.username}
                            src={`https://via.placeholder.com/32x32?text=${question.author.username.charAt(
                              0
                            )}`}
                            sx={{ width: 32, height: 32 }}
                            className="mr-2"
                          />
                          <Typography
                            variant="caption"
                            className="text-gray-600"
                          >
                            {question.author.username} asked{" "}
                            {new Date(question.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        {/* Status Chips */}
                        {isPending && isOwner && (
                          <Chip
                            label="Pending Review"
                            size="small"
                            color="warning"
                            className="bg-yellow-100 text-yellow-800"
                          />
                        )}
                        {isDenied && isOwner && (
                          <Box className="flex items-center">
                            <Chip
                              label="Denied"
                              size="small"
                              color="error"
                              className="bg-red-100 text-red-800 mr-2"
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) =>
                                handleDeleteQuestion(question._id, e)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                        {isAccepted && (
                          <Chip
                            label="Accepted"
                            size="small"
                            color="success"
                            className="bg-green-100 text-green-800"
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
};

export default QuestionList;
