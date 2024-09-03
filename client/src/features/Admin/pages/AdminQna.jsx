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
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useFetchQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useFetchQuestionByIdMutation, // Add this if you have it for fetching a single question
} from "../../QnA/questionService";

function AdminQna() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState(null); // State for selected question

  // Fetch, update, and delete mutations
  const [fetchQuestions] = useFetchQuestionsMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [fetchQuestionById] = useFetchQuestionByIdMutation(); // Fetch single question

  // Dialog state
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false); // State for question details popup
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
    // Filter questions based on the selected status
    if (statusFilter === "all") {
      setFilteredQuestions(questions);
    } else {
      setFilteredQuestions(questions.filter((q) => q.status === statusFilter));
    }
  }, [questions, statusFilter]);

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
    setSelectedQuestion(null); // Reset selected question
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
  const CodeBlock = ({ code, language }) => (
    <div
      style={{
        backgroundColor: '#2e2e2e',
        borderRadius: '4px',
        color: '#f8f8f2',
        padding: '16px',
        overflowX: 'auto',
        marginTop: '10px',
      }}
    >
      <pre style={{ margin: 0 }}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
  return (
    <>
      <FormControl fullWidth style={{ margin: "20px" }}>
        <InputLabel>Status Filter</InputLabel>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          label="Status Filter"
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="accepted">Accepted</MenuItem>
          <MenuItem value="denied">Denied</MenuItem>
        </Select>
      </FormControl>
      <Button onClick={handleRefresh} variant="contained" color="primary" style={{ margin: "20px" }}>
        Refresh
      </Button>
      <TableContainer component={Paper}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <CircularProgress />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Typography variant="h6" align="center" style={{ padding: "20px" }}>
            No questions available.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date Requested</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question._id}>
                  <TableCell>
                    <Button onClick={() => handleOpenQuestionDialog(question._id)}>
                      {question.title}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(question.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {question.status.charAt(0).toUpperCase() +
                      question.status.slice(1)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() =>
                        handleOpenConfirmDialog("accept", question._id)
                      }
                      color="primary"
                      disabled={question.status === "accepted"} // Disable if already accepted
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        handleOpenConfirmDialog("deny", question._id)
                      }
                      color="error"
                      disabled={question.status === "denied"} // Disable if already denied
                    >
                      <CloseIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        handleOpenDeleteDialog("delete", question._id)
                      }
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Question Details Dialog */}
      <Dialog open={openQuestionDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>Question Details</DialogTitle>
      <DialogContent>
      {selectedQuestion ? (
    <>
      <Typography variant="h6" component="div" style={{ marginBottom: '10px' }}>
        {selectedQuestion.title}
      </Typography>
      <Typography variant="body1" style={{ marginBottom: '20px', lineHeight: '1.6' }}>
        {selectedQuestion.content}
      </Typography>
      {selectedQuestion.codeBlocks.length > 0 && (
        <div>
          <Typography variant="subtitle1" component="div" style={{ marginBottom: '10px' }}>
            Code Blocks:
          </Typography>
          {selectedQuestion.codeBlocks.map((block, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <CodeBlock code={block.content} language={block.language} />
            </div>
          ))}
        </div>
      )}
      {selectedQuestion.tags.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="subtitle1" component="div" style={{ marginBottom: '10px' }}>
            Tags:
          </Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {selectedQuestion.tags.map((tag, index) => (
              <Typography
                key={index}
                variant="body2"
                style={{
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  padding: '5px 10px',
                }}
              >
                {tag}
              </Typography>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <IconButton
          onClick={() => handleOpenConfirmDialog("accept", selectedQuestion._id)}
          color="primary"
          disabled={selectedQuestion.status === "accept"}
        >
          <CheckIcon />
        </IconButton>
        <IconButton
          onClick={() => handleOpenConfirmDialog("deny", selectedQuestion._id)}
          color="error"
          disabled={selectedQuestion.status === "deny"}
        >
          <CloseIcon />
        </IconButton>
        <IconButton
          onClick={() => handleOpenDeleteDialog("delete", selectedQuestion._id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </>
  ) : (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <CircularProgress />
    </div>
  )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>

      {/* Confirm Action Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogActions>
          <Button onClick={handleAction} color="primary">
            Confirm
          </Button>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogActions>
          <Button onClick={handleAction} color="error">
            Delete
          </Button>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminQna;
