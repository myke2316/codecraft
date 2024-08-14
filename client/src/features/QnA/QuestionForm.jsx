import React, { useState } from "react";
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
import { useCreateQuestionMutation } from "./questionService";
import { useDispatch, useSelector } from "react-redux";

const QuestionForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [codeBlocks, setCodeBlocks] = useState([{ language: "", content: "" }]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const dispatch = useDispatch();
  const authorId = useSelector((state) => state.user.userDetails._id);

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

  const [createQuestion, { isLoading: isLoadingCreateQuestion }] =
    useCreateQuestionMutation();

  const handleSubmit = async () => {
    try {
      const data = await createQuestion({
        title,
        content,
        tags,
        codeBlocks,
        authorId,
      }).unwrap();

      // Show success message
      setSnackbarMessage("Question posted successfully!");
      setOpenSnackbar(true);

      // Clear form fields
      setTitle("");
      setContent("");
      setTags([]);
      setCodeBlocks([{ language: "", content: "" }]);
    } catch (error) {
      // Handle error
      setSnackbarMessage("Error posting question. Please try again.");
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
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit Question
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

export default QuestionForm;
