import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Typography,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  TextField,
  Chip,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  useFetchQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useFetchQuestionByIdMutation,
} from "../../QnA/questionService";

const CodeBlock = ({ code, language }) => (
  <Box
    component="pre"
    sx={{
      backgroundColor: "#f5f5f5",
      borderRadius: 1,
      color: "#333",
      p: 2,
      overflowX: "auto",
      mt: 1,
      '& code': {
        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      },
    }}
  >
    <code className={`language-${language}`}>{code}</code>
  </Box>
);

function AdminQna() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [fetchQuestions] = useFetchQuestionsMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [fetchQuestionById] = useFetchQuestionByIdMutation();

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [questionId, setQuestionId] = useState(null);

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await fetchQuestions().unwrap();
        setQuestions(response && response.length > 0 ? response : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    getQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    let filtered = questions;
    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.author.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredQuestions(filtered);
  }, [questions, statusFilter, searchTerm]);

  const handleAction = async () => {
    try {
      if (currentAction === "accept") {
        await updateQuestion({ questionId, status: "accepted" }).unwrap();
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question._id === questionId
              ? { ...question, status: "accepted" }
              : question
          )
        );
      } else if (currentAction === "deny") {
        await updateQuestion({ questionId, status: "denied" }).unwrap();
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question._id === questionId
              ? { ...question, status: "denied" }
              : question
          )
        );
      } else if (currentAction === "delete") {
        await deleteQuestion(questionId).unwrap();
        setQuestions((prevQuestions) =>
          prevQuestions.filter((question) => question._id !== questionId)
        );
      }
      handleCloseDialog();
    } catch (error) {
      console.error(`Error ${currentAction} question:`, error);
    }
  };

  const handleOpenConfirmDialog = (action, id) => {
    setCurrentAction(action);
    setQuestionId(id);
    setOpenConfirmDialog(true);
  };

  const handleOpenDeleteDialog = (action, id) => {
    setCurrentAction(action);
    setQuestionId(id);
    setOpenDeleteDialog(true);
  };

  const handleOpenQuestionDialog = async (id) => {
    try {
      const question = await fetchQuestionById(id).unwrap();
      setSelectedQuestion(question);
      setOpenQuestionDialog(true);
    } catch (error) {
      console.error("Error fetching question details:", error);
    }
  };

  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
    setOpenDeleteDialog(false);
    setOpenQuestionDialog(false);
    setQuestionId(null);
    setCurrentAction(null);
    setSelectedQuestion(null);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetchQuestions().unwrap();
      setQuestions(response && response.length > 0 ? response : []);
    } catch (error) {
      console.error("Error refetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6 min-h-screen" sx={{ 
    mt: 4, 
    backgroundColor: 'white', 
    boxShadow: 3, // This applies a default shadow from MUI's theme
    borderRadius: 2 // Optional: adds rounded corners
  }}>
      <Typography variant="h4" className="mb-7 p-5 font-bold">
        Manage Q&A
      </Typography>
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={4}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-filter-label">Status Filter</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status Filter"
              startAdornment={<FilterListIcon className="mr-2" />}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="denied">Denied</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search by Title or Username"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            onClick={handleRefresh}
            variant="contained"
            fullWidth
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          {loading ? (
            <Box className="flex justify-center p-6">
              <CircularProgress />
            </Box>
          ) : filteredQuestions.length === 0 ? (
            <Typography variant="h6" align="center" className="p-6 text-gray-600">
              No questions available.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                <TableRow sx={{bgcolor: 'rgb(110, 97, 171)', color: "white"}}>
                    <TableCell sx={{color: "white"}}>Title</TableCell>
                    <TableCell sx={{color: "white"}}>Author</TableCell>
                    <TableCell sx={{color: "white"}}>Date Requested</TableCell>
                    <TableCell sx={{color: "white"}}>Status</TableCell>
                    <TableCell sx={{color: "white"}} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell>
                        <Button
                          onClick={() => handleOpenQuestionDialog(question._id)}
                          color="primary"
                        >
                          {question.title}
                        </Button>
                      </TableCell>
                      <TableCell>{question.author?.username}</TableCell>
                      <TableCell>
                        {new Date(question.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                          color={
                            question.status === "accepted"
                              ? "success"
                              : question.status === "denied"
                              ? "error"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenConfirmDialog("accept", question._id)}
                          color="primary"
                          disabled={question.status === "accepted"}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenConfirmDialog("deny", question._id)}
                          color="error"
                          disabled={question.status === "denied"}
                        >
                          <CloseIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenDeleteDialog("delete", question._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={openQuestionDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Question Details</DialogTitle>
        <DialogContent>
          {selectedQuestion ? (
            <>
              <Typography variant="h5" component="div" className="mb-4 font-bold">
                {selectedQuestion.title}
              </Typography>
              <Typography variant="body1" className="mb-6 leading-relaxed">
                {selectedQuestion.content}
              </Typography>
              {selectedQuestion.codeBlocks.length > 0 && (
                <Box className="mb-6">
                  <Typography variant="h6" component="div" className="mb-2 font-semibold">
                    Code Blocks:
                  </Typography>
                  {selectedQuestion.codeBlocks.map((block, index) => (
                    <Box key={index} className="mb-4 border border-gray-300 rounded-md p-4 bg-gray-50">
                      <CodeBlock code={block.content} language={block.language} />
                    </Box>
                  ))}
                </Box>
              )}
              {selectedQuestion.tags.length > 0 && (
                <Box className="mt-4">
                  <Typography variant="h6" component="div" className="mb-2 font-semibold">
                    Tags:
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {selectedQuestion.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
              <Box className="mt-6 flex gap-2">
                <Button
                  onClick={() => handleOpenConfirmDialog("accept", selectedQuestion._id)}
                  variant="contained"
                  color="primary"
                  startIcon={<CheckIcon />}
                  disabled={selectedQuestion.status === "accepted"}
                >
                  Accept
                </Button>
                <Button
                  onClick={() => handleOpenConfirmDialog("deny", selectedQuestion._id)}
                  variant="contained"
                  color="error"
                  startIcon={<CloseIcon />}
                  disabled={selectedQuestion.status === "denied"}
                >
                  Deny
                </Button>
                <Button
                  onClick={() => handleOpenDeleteDialog("delete", selectedQuestion._id)}
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </Box>
            </>
          ) : (
            <Box className="flex justify-center p-6">
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions className="p-4">
          <Button onClick={handleCloseDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {currentAction === "accept"
            ? "Accept Question"
            : currentAction === "deny"
            ? "Deny Question"
            : "Delete Question"}
        </DialogTitle>
        <DialogContent>
          <Typography className="mt-4">
            Are you sure you want to {currentAction} this question?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button onClick={handleAction} variant="contained" color={currentAction === "accept" ? "primary" : "error"}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <Typography className="mt-4">
            Are you sure you want to delete this question? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button onClick={handleAction} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminQna;