// src/pages/EditQuestionPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useFetchQuestionsMutation,
  useUpdateQuestionMutation,
} from "../questionService";

const EditQuestionPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const question = location.state?.question;
  const [updateQuestion, { isLoading: isLoadingUpdateQuestion }] =
    useUpdateQuestionMutation();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [codeBlocks, setCodeBlocks] = useState([{ language: "", content: "" }]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const authorId = useSelector((state) => state.user.userDetails._id);

  useEffect(() => {
    if (question) {
      setTitle(question.title);
      setContent(question.content);
      setTags(question.tags);
      setCodeBlocks(question.codeBlocks);
    }
  }, [question]);

  const handleTagChange = (event) => {
    setTags(event.target.value);
  };

  const handleCodeBlockChange = (index, field, value) => {
    const newCodeBlocks = [...codeBlocks];
    newCodeBlocks[index][field] = value;
    setCodeBlocks(newCodeBlocks);
  };

  const handleAddCodeBlock = () => {
    setCodeBlocks([...codeBlocks, { language: "", content: "" }]);
  };

  const handleRemoveCodeBlock = (index) => {
    const newCodeBlocks = codeBlocks.filter((_, i) => i !== index);
    setCodeBlocks(newCodeBlocks);
  };

  const handleSubmit = async () => {
    console.log(question._id);
    try {
      const result = await updateQuestion({
        questionId: question._id,
        title,
        content,
        tags,
        codeBlocks,
        authorId,
      }).unwrap();
      console.log(result);
      // Show success message
      setSnackbarMessage("Question updated successfully!");
      setOpenSnackbar(true);

      // Redirect back to the question page
      navigate(`/qna/${authorId}/question/${question._id}`);
    } catch (error) {
      // Handle error
      console.log(error);
      setSnackbarMessage("Error updating question. Please try again.");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box component={Paper} className="p-4 mb-4">
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        className="mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="Content"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        className="mb-4"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <TextField
        label="Tags"
        variant="outlined"
        select
        fullWidth
        className="mb-4"
        value={tags}
        onChange={handleTagChange}
        SelectProps={{
          multiple: true,
        }}
      >
        {["html", "css", "javascript", "php"].map((tag) => (
          <MenuItem key={tag} value={tag}>
            {tag.toUpperCase()}
          </MenuItem>
        ))}
      </TextField>

      {codeBlocks.map((codeBlock, index) => (
        <Box key={index} className="mb-4">
          <TextField
            label="Language"
            variant="outlined"
            select
            fullWidth
            className="mb-2"
            value={codeBlock.language}
            onChange={(e) =>
              handleCodeBlockChange(index, "language", e.target.value)
            }
          >
            {["html", "css", "javascript", "php"].map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Code Content"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            className="mb-2"
            value={codeBlock.content}
            onChange={(e) =>
              handleCodeBlockChange(index, "content", e.target.value)
            }
          />
          <IconButton
            onClick={() => handleRemoveCodeBlock(index)}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button
        variant="outlined"
        color="primary"
        startIcon={<AddCircleIcon />}
        onClick={handleAddCodeBlock}
        className="mb-4"
      >
        Add Code Block
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isLoadingUpdateQuestion}
      >
        Update Question
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes("Error") ? "error" : "success"}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditQuestionPage;
