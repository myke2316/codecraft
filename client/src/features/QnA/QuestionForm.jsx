import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  IconButton,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCreateQuestionMutation } from "./questionService";
import { Editor } from "@monaco-editor/react";
import { toast } from "react-toastify";

const MAX_CODE_BLOCKS = 6;
const MAX_TAGS = 10;
const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 1000;
const QuestionForm = ({ userId, onSubmitSuccess }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([
    { language: "html", content: "" },
  ]);

  const predefinedTags = ["html", "css", "javascript", "php"];

  const handleAddTag = (newTag) => {
    const normalizedNewTag = newTag.toLowerCase();
    if (
      normalizedNewTag &&
      !tags.some((tag) => tag.toLowerCase() === normalizedNewTag) &&
      tags.length < MAX_TAGS
    ) {
      setTags([...tags, normalizedNewTag]);
      setCustomTag("");
    } else if (tags.length >= MAX_TAGS) {
      toast.warning(`Maximum of ${MAX_TAGS} tags allowed.`);
    } else if (tags.some((tag) => tag.toLowerCase() === normalizedNewTag)) {
      toast.warning("This tag already exists.");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(
      tags.filter((tag) => tag.toLowerCase() !== tagToRemove.toLowerCase())
    );
  };

  const handleCodeBlockChange = (index, field, value) => {
    const newCodeBlocks = [...codeBlocks];
    newCodeBlocks[index][field] = value;
    setCodeBlocks(newCodeBlocks);
  };

  const handleAddCodeBlock = () => {
    if (codeBlocks.length < MAX_CODE_BLOCKS) {
      setCodeBlocks([...codeBlocks, { language: "html", content: "" }]);
    } else {
      toast.warning(`Maximum of ${MAX_CODE_BLOCKS} code blocks allowed.`);
    }
  };

  const handleRemoveCodeBlock = (index) => {
    const newCodeBlocks = codeBlocks.filter((_, i) => i !== index);
    setCodeBlocks(newCodeBlocks);
  };

  const [createQuestion, { isLoading: isLoadingCreateQuestion }] =
    useCreateQuestionMutation();

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    try {
      await createQuestion({
        title,
        content,
        tags,
        codeBlocks,
        authorId: userId,
      }).unwrap();

      toast.success("Question posted for admin approval!");
      setTitle("");
      setContent("");
      setTags([]);
      setCodeBlocks([{ language: "javascript", content: "" }]);

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast.error("Error posting question. Please try again.");
    }
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
        inputProps={{ maxLength: MAX_TITLE_LENGTH }}
        helperText={`${title.length}/${MAX_TITLE_LENGTH} characters`}
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
        inputProps={{ maxLength: MAX_CONTENT_LENGTH }}
        helperText={`${content.length}/${MAX_CONTENT_LENGTH} characters`}
      />
      <Typography variant="subtitle1" className="mb-2">
        Tags ({tags.length}/{MAX_TAGS})
      </Typography>
      <Box className="mb-4">
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
            onClick={() => handleAddTag(customTag)}
            disabled={!customTag || tags.length >= MAX_TAGS}
          >
            Add Tag
          </Button>
        </Box>

        <Typography variant="caption" className="mt-2 block">
          Select from predefined tags or add your own (max {MAX_TAGS})
        </Typography>
        <Box className="flex flex-wrap gap-2 mt-2">
          {predefinedTags.map((tag) => (
            <Chip
              key={tag}
              label={tag.toUpperCase()}
              onClick={() => handleAddTag(tag)}
              size="small"
              color={
                tags.some((t) => t.toLowerCase() === tag.toLowerCase())
                  ? "primary"
                  : "default"
              }
            />
          ))}
        </Box>
      </Box>

      {codeBlocks.map((codeBlock, index) => (
        <div key={index} className="mb-6 bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <Typography
              variant="subtitle1"
              className="font-semibold text-gray-700"
            >
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
              onChange={(value) =>
                handleCodeBlockChange(index, "content", value)
              }
            />
          </div>
        </div>
      ))}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddCodeBlock}
          className="mb-2 sm:mb-0"
          disabled={codeBlocks.length >= MAX_CODE_BLOCKS}
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
    </div>
  );
};

export default QuestionForm;
