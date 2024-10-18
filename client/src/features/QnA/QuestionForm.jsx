import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCreateQuestionMutation } from "./questionService";
import { Editor } from "@monaco-editor/react";
import {toast} from 'react-toastify'
const QuestionForm = ({ userId, onSubmitSuccess }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([{ language: "javascript", content: "" }]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const predefinedTags = ["html", "css", "javascript", "php"];

  const handleTagChange = (event) => {
    setTags(event.target.value);
  };

  const handleAddCustomTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag]);
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleCodeBlockChange = (index, field, value) => {
    const newCodeBlocks = [...codeBlocks];
    newCodeBlocks[index][field] = value;
    setCodeBlocks(newCodeBlocks);
  };

  const handleAddCodeBlock = () => {
    setCodeBlocks([...codeBlocks, { language: "javascript", content: "" }]);
  };

  const handleRemoveCodeBlock = (index) => {
    const newCodeBlocks = codeBlocks.filter((_, i) => i !== index);
    setCodeBlocks(newCodeBlocks);
  };

  const [createQuestion, { isLoading: isLoadingCreateQuestion }] =
    useCreateQuestionMutation();

  const handleSubmit = async () => {
    try {
      await createQuestion({
        title,
        content,
        tags,
        codeBlocks,
        authorId: userId,
      }).unwrap();

      setSnackbarMessage("Question posted successfully!");
      setOpenSnackbar(true);
      toast.success("Question posted!")
      setTitle("");
      setContent("");
      setTags([]);
      setCodeBlocks([{ language: "javascript", content: "" }]);

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      setSnackbarMessage("Error posting question. Please try again.");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: "on",
    roundedSelection: false,
    readOnly: false,
    theme: "vs-dark",
  };

  return (
    <div className="bg-white p-6">
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
      <Box className="mb-4">
        <Typography variant="subtitle1" className="mb-2">Tags</Typography>
        <Box className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag.toUpperCase()}
              onDelete={() => handleRemoveTag(tag)}
              size="small"
            />
          ))}
        </Box>
        <Box className="flex gap-2">
          <TextField
            label="Add custom tag"
            variant="outlined"
            size="small"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={handleAddCustomTag}
            disabled={!customTag}
          >
            Add Tag
          </Button>
        </Box>
        <Typography variant="caption" className="mt-2 block">
          Select from predefined tags or add your own
        </Typography>
        <Box className="flex flex-wrap gap-2 mt-2">
          {predefinedTags.map((tag) => (
            <Chip
              key={tag}
              label={tag.toUpperCase()}
              onClick={() => !tags.includes(tag) && setTags([...tags, tag])}
              size="small"
              color={tags.includes(tag) ? "primary" : "default"}
            />
          ))}
        </Box>
      </Box>

      {codeBlocks.map((codeBlock, index) => (
        <div key={index} className="mb-6 bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <Typography variant="subtitle1" className="font-semibold text-gray-700">
              Code Block {index + 1}
            </Typography>
            <IconButton
              onClick={() => handleRemoveCodeBlock(index)}
              color="secondary"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </div>
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
          <Typography variant="subtitle2" className="mb-1 text-gray-600">
            Code Content:
          </Typography>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <Editor
              height="200px"
              language={codeBlock.language}
              value={codeBlock.content}
              options={editorOptions}
              onChange={(value) => handleCodeBlockChange(index, "content", value)}
            />
          </div>
        </div>
      ))}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddCodeBlock}
        >
          Add Code Block
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
          disabled={isLoadingCreateQuestion}
        >
          {isLoadingCreateQuestion ? "Submitting..." : "Submit Question"}
        </Button>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes("Error") ? "error" : "success"}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default QuestionForm;