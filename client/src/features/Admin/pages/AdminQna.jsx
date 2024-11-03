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
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestoreIcon from "@mui/icons-material/Restore";
import {
  useFetchQuestionsMutation,
  useUpdateQuestionMutation,
  useFetchQuestionByIdMutation,
  useUpdateAnswerStatusMutation,
  useFetchAnswersMutation,
} from "../../QnA/questionService";
import Restore from "@mui/icons-material/Restore";

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
      "& code": {
        fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
      },
    }}
  >
    <code className={`language-${language}`}>{code}</code>
  </Box>
);

function AdminQna() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  const [fetchQuestions] = useFetchQuestionsMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [fetchQuestionById] = useFetchQuestionByIdMutation();
  const [updateAnswerStatus] = useUpdateAnswerStatusMutation();
  const [fetchAnswers] = useFetchAnswersMutation();

  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [openAnswerDialog, setOpenAnswerDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [itemId, setItemId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsResponse = await fetchQuestions().unwrap();
        setQuestions(
          questionsResponse && questionsResponse.length > 0
            ? questionsResponse
            : []
        );
        const answersResponse = await fetchAnswers().unwrap();
        setAnswers(
          answersResponse && answersResponse.length > 0 ? answersResponse : []
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchQuestions, fetchAnswers]);

  useEffect(() => {
    let filtered = currentTab === 0 ? questions : answers;
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  }, [questions, answers, statusFilter, searchTerm, currentTab]);

  const handleAction = async () => {
    try {
      if (currentTab === 0) {
        // Question actions
        await updateQuestion({
          questionId: itemId,
          status: currentAction,
        }).unwrap();
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question._id === itemId
              ? { ...question, status: currentAction }
              : question
          )
        );
      } else {
        // Answer actions
        const res = await updateAnswerStatus({
          answerId: itemId,
          status: currentAction,
        }).unwrap();
        console.log(res);
        setAnswers((prevAnswers) =>
          prevAnswers.map((answer) =>
            answer._id === itemId
              ? { ...answer, status: currentAction }
              : answer
          )
        );
      }
      handleCloseDialog();
    } catch (error) {
      console.error(`Error ${currentAction} item:`, error);
    }
  };

  const handleOpenConfirmDialog = (action, id) => {
    setCurrentAction(action);
    setItemId(id);
    setOpenConfirmDialog(true);
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

  const handleOpenAnswerDialog = async (answer) => {
    setSelectedAnswer(answer);
    try {
      const question = await fetchQuestionById(answer.questionId).unwrap();
      setSelectedQuestion(question);
    } catch (error) {
      console.error("Error fetching question details:", error);
    }
    setOpenAnswerDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
    setOpenQuestionDialog(false);
    setOpenAnswerDialog(false);
    setItemId(null);
    setCurrentAction(null);
    setSelectedQuestion(null);
    setSelectedAnswer(null);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const questionsResponse = await fetchQuestions().unwrap();
      setQuestions(
        questionsResponse && questionsResponse.length > 0
          ? questionsResponse
          : []
      );
      const answersResponse = await fetchAnswers().unwrap();
      setAnswers(
        answersResponse && answersResponse.length > 0 ? answersResponse : []
      );
    } catch (error) {
      console.error("Error refetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      className="p-6 min-h-screen"
      sx={{
        mt: 4,
        backgroundColor: "white",
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" className="mb-7 p-5 font-bold">
        Manage Community Forum
      </Typography>
      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        className="mb-4"
      >
        <Tab label="Questions" />
        <Tab label="Answers" />
      </Tabs>
      <Alert sx={{ mb: "20px" }} severity="warning">
        Denied Users will be automatically deleted in 10 hours
      </Alert>
      {currentTab === 1 && (
        <Alert sx={{ mb: "20px" }} severit="info">
          Note: Answers are publicly published when status is either Pending or
          Approved
        </Alert>
      )}
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
              <MenuItem value="accepted">Approved</MenuItem>
              <MenuItem value="denied">Denied</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search"
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
          ) : filteredItems.length === 0 ? (
            <Typography
              variant="h6"
              align="center"
              className="p-6 text-gray-600"
            >
              No items available.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{ bgcolor: "rgb(110, 97, 171)", color: "white" }}
                  >
                    <TableCell sx={{ color: "white" }}>
                      {currentTab === 0 ? "Title" : "Content"}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>Author</TableCell>
                    <TableCell sx={{ color: "white" }}>Date</TableCell>
                    <TableCell sx={{ color: "white" }}>Status</TableCell>
                    <TableCell sx={{ color: "white" }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Button
                          onClick={() =>
                            currentTab === 0
                              ? handleOpenQuestionDialog(item._id)
                              : handleOpenAnswerDialog(item)
                          }
                          color="primary"
                        >
                          <Typography
                            variant="button"
                            noWrap
                            sx={{
                              maxWidth: "100%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "inline-block",
                            }}
                          >
                            {currentTab === 0
                              ? item?.title?.substring(0, 50) + "..."
                              : item?.content?.substring(0, 50) + "..."}
                          </Typography>
                        </Button>
                      </TableCell>
                      {console.log(item)}
                      <TableCell>{item.author?.username}</TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)
                          }
                          color={
                            item.status === "accepted"
                              ? "success"
                              : item.status === "denied"
                              ? "error"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() =>
                            handleOpenConfirmDialog("accepted", item._id)
                          }
                          color="primary"
                          disabled={item.status === "accepted"}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleOpenConfirmDialog("pending", item._id)
                          }
                          color="primary"
                          disabled={item.status === "pending"}
                        >
                          <RestoreIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleOpenConfirmDialog("denied", item._id)
                          }
                          color="error"
                          disabled={item.status === "denied"}
                        >
                          <CloseIcon />
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

      <Dialog
        open={openQuestionDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Question Details</DialogTitle>
        <DialogContent>
          {selectedQuestion ? (
            <>
              <Typography
                variant="h5"
                component="div"
                className="mb-4 font-bold"
              >
                {selectedQuestion.title}
              </Typography>
              <Typography variant="body1" className="mb-6 leading-relaxed">
                {selectedQuestion.content}
              </Typography>
              {selectedQuestion.codeBlocks.length > 0 && (
                <Box className="mb-6">
                  <Typography
                    variant="h6"
                    component="div"
                    className="mb-2 font-semibold"
                  >
                    Code Blocks:
                  </Typography>
                  {selectedQuestion.codeBlocks.map((block, index) => (
                    <Box
                      key={index}
                      className="mb-4 border border-gray-300 rounded-md p-4 bg-gray-50"
                    >
                      <CodeBlock
                        code={block.content}
                        language={block.language}
                      />
                    </Box>
                  ))}
                </Box>
              )}
              {selectedQuestion.tags.length > 0 && (
                <Box className="mt-4">
                  <Typography
                    variant="h6"
                    component="div"
                    className="mb-2 font-semibold"
                  >
                    Tags:
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {selectedQuestion.tags.map((tag, index) => (
                      <Chip key={index} label={tag} variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              <Box className="mt-6 flex gap-2">
                <Button
                  onClick={() =>
                    handleOpenConfirmDialog("accepted", selectedQuestion._id)
                  }
                  variant="contained"
                  color="primary"
                  startIcon={<CheckIcon />}
                  disabled={selectedQuestion.status === "accepted"}
                >
                  Accept
                </Button>
                <Button
                  onClick={() =>
                    handleOpenConfirmDialog("denied", selectedQuestion._id)
                  }
                  variant="contained"
                  color="error"
                  startIcon={<CloseIcon />}
                  disabled={selectedQuestion.status === "denied"}
                >
                  Deny
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

      <Dialog
        open={openAnswerDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Answer Details</DialogTitle>
        <DialogContent>
          {selectedAnswer && selectedQuestion ? (
            <>
              <Typography
                variant="h6"
                component="div"
                className="mb-4 font-bold"
              >
                Related Question: {selectedQuestion.title}
              </Typography>
              <Typography variant="body2" className="mb-2">
                Question Author: {selectedQuestion.author?.username}
              </Typography>
              <Typography variant="body2" className="mb-4">
                Question Created:{" "}
                {new Date(selectedQuestion.createdAt).toLocaleString()}
              </Typography>
              {selectedQuestion.codeBlocks.length > 0 && (
                <Box className="mb-6">
                  <Typography
                    variant="subtitle1"
                    component="div"
                    className="mb-2 font-semibold"
                  >
                    Question Code Blocks:
                  </Typography>
                  {selectedQuestion.codeBlocks.map((block, index) => (
                    <Box
                      key={index}
                      className="mb-4 border border-gray-300  rounded-md p-4 bg-gray-50"
                    >
                      <CodeBlock
                        code={block.content}
                        language={block.language}
                      />
                    </Box>
                  ))}
                </Box>
              )}
              <Divider className="my-4" />
              <Typography
                variant="h6"
                component="div"
                className="mb-4 font-bold"
              >
                Answer:
              </Typography>
              <Typography variant="body1" className="mb-6 leading-relaxed">
                {selectedAnswer.content}
              </Typography>
              {selectedAnswer.codeBlocks &&
                selectedAnswer.codeBlocks.length > 0 && (
                  <Box className="mb-6">
                    <Typography
                      variant="subtitle1"
                      component="div"
                      className="mb-2 font-semibold"
                    >
                      Answer Code Blocks:
                    </Typography>
                    {selectedAnswer.codeBlocks.map((block, index) => (
                      <Box
                        key={index}
                        className="mb-4 border border-gray-300 rounded-md p-4 bg-gray-50"
                      >
                        <CodeBlock
                          code={block.content}
                          language={block.language}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              <Box className="mt-6 flex gap-2">
                <Button
                  onClick={() =>
                    handleOpenConfirmDialog("accepted", selectedAnswer._id)
                  }
                  variant="contained"
                  color="primary"
                  startIcon={<CheckIcon />}
                  disabled={selectedAnswer.status === "accepted"}
                >
                  Accept
                </Button>
                <Button
                  onClick={() =>
                    handleOpenConfirmDialog("denied", selectedAnswer._id)
                  }
                  variant="contained"
                  color="error"
                  startIcon={<CloseIcon />}
                  disabled={selectedAnswer.status === "denied"}
                >
                  Deny
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
          {currentAction === "accepted"
            ? "Approve Item"
            : currentAction === "denied"
            ? "Deny Item "
            : "Revert Item"}
        </DialogTitle>
        <DialogContent>
          <Typography className="mt-4">
            Are you sure you want to{" "}
            {currentAction === "accepted"
              ? "approve "
              : currentAction === "denied"
              ? "deny "
              : "revert "}
            this {currentTab === 0 ? "question" : "answer"}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={currentAction === "accepted" ? "primary" : "error"}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminQna;
