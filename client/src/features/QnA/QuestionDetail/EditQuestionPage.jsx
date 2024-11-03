import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  IconButton,
  Typography,
  Chip,
  Box,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useFetchQuestionsMutation,
  useUpdateQuestionMutation,
} from "../questionService";
import { Editor } from "@monaco-editor/react";
import { toast } from "react-toastify";

const MAX_TAGS = 5;
const MAX_CODE_BLOCKS = 6;
const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 1000;
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
  const [customTag, setCustomTag] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([{ language: "javascript", content: "" }]);
  const authorId = useSelector((state) => state.user.userDetails._id);

  const predefinedTags = ["html", "css", "javascript", "php"];

  useEffect(() => {
    if (question) {
      setTitle(question.title);
      setContent(question.content);
      setTags(question.tags.map(tag => tag.toLowerCase()));
      setCodeBlocks(question.codeBlocks);
    }
  }, [question]);

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
    setTags(tags.filter((tag) => tag.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleCodeBlockChange = (index, field, value) => {
    const newCodeBlocks = [...codeBlocks];
    newCodeBlocks[index][field] = value;
    setCodeBlocks(newCodeBlocks);
  };

  const handleAddCodeBlock = () => {
    if (codeBlocks.length < MAX_CODE_BLOCKS) {
      setCodeBlocks([...codeBlocks, { language: "javascript", content: "" }]);
    } else {
      toast.warning(`Maximum of ${MAX_CODE_BLOCKS} code blocks allowed.`);
    }
  };

  const handleRemoveCodeBlock = (index) => {
    const newCodeBlocks = codeBlocks.filter((_, i) => i !== index);
    setCodeBlocks(newCodeBlocks);
  };

  const validateCodeBlocks = (blocks) => {
    return blocks.filter(block => block.content.trim() !== "");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    const validCodeBlocks = validateCodeBlocks(codeBlocks);
    if (validCodeBlocks.length !== codeBlocks.length) {
      const removedBlocks = codeBlocks.length - validCodeBlocks.length;
      toast.warning(`${removedBlocks} empty code block(s) will be removed.`);
    }

    try {
      const result = await updateQuestion({
        questionId: question._id,
        title,
        content,
        tags,
        codeBlocks: validCodeBlocks,
        authorId,
      }).unwrap();
      console.log(result);
      toast.success("Question updated successfully!");
      navigate(`/qna/${authorId}/question/${question._id}`);
    } catch (error) {
      console.error(error);
      toast.error("Error updating question. Please try again.");
    }
  };

  const handleBack = () => {
    navigate(-1);
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
    <Box className="mx-auto px-4 py-8">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        className="mb-4 text-primary dark:text-primary-dark"
      >
        Back
      </Button>
      <Card className="bg-background dark:bg-background-dark shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-6">
          <Typography variant="h4" className="mb-6 text-foreground dark:text-foreground-dark">
            Edit Question
          </Typography>
          <Box className="flex flex-col gap-2">
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              className="mb-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              InputProps={{
                className: "bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark",
              }}
              required
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
              InputProps={{
                className: "bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark",
              }}
              required
              inputProps={{ maxLength: MAX_CONTENT_LENGTH }}
              helperText={`${content.length}/${MAX_CONTENT_LENGTH} characters`}
            />
          </Box>
          <Box className="mb-4">
            <Typography variant="subtitle1" className="mb-2 text-foreground dark:text-foreground-dark">
              Tags ({tags.length}/{MAX_TAGS})
            </Typography>
            <Box className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag.toUpperCase()}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  className="bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark"
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
                InputProps={{
                  className: "bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark",
                }}
              />
              <Button
                variant="outlined"
                onClick={() => handleAddTag(customTag)}
                disabled={!customTag || tags.length >= MAX_TAGS}
                className="text-primary dark:text-primary-dark"
              >
                Add Tag
              </Button>
            </Box>
            <Typography variant="caption" className="mt-2 block text-muted dark:text-muted-dark">
              Select from predefined tags or add your own (max {MAX_TAGS})
            </Typography>
            <Box className="flex flex-wrap gap-2 mt-2">
              {predefinedTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag.toUpperCase()}
                  onClick={() => handleAddTag(tag)}
                  size="small"
                  color={tags.some((t) => t.toLowerCase() === tag.toLowerCase()) ? "primary" : "default"}
                  className="cursor-pointer bg-secondary text-secondary-foreground dark:bg-secondary-dark dark:text-secondary-foreground-dark"
                />
              ))}
            </Box>
          </Box>

          {codeBlocks.map((codeBlock, index) => (
            <Card key={index} className="mb-6 bg-card dark:bg-card-dark">
              <CardContent>
                <Box className="flex justify-between items-center mb-2">
                  <Typography variant="subtitle1" className="font-semibold text-foreground dark:text-foreground-dark">
                    Code Block {index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => handleRemoveCodeBlock(index)}
                    size="small"
                    className="text-error dark:text-error-dark"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
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
                  InputProps={{
                    className: "bg-input dark:bg-input-dark text-foreground dark:text-foreground-dark",
                  }}
                >
                  {["html", "css", "javascript", "php"].map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>
                <Typography variant="subtitle2" className="mb-1 text-foreground dark:text-foreground-dark">
                  Code Content:
                </Typography>
                <Box className="border border-border dark:border-border-dark rounded-md overflow-hidden">
                  <Editor
                    height="200px"
                    language={codeBlock.language}
                    value={codeBlock.content}
                    options={editorOptions}
                    onChange={(value) => handleCodeBlockChange(index, "content", value)}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </CardContent>
        <CardActions className="bg-card dark:bg-card-dark p-4 flex justify-between">
          <Button
            variant="outlined"
            startIcon={<AddCircleIcon />}
            onClick={handleAddCodeBlock}
            className="text-primary dark:text-primary-dark"
            disabled={codeBlocks.length >= MAX_CODE_BLOCKS}
          >
            Add Code Block
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isLoadingUpdateQuestion}
            className="bg-primary text-primary-foreground dark:bg-primary-dark dark:text-primary-foreground-dark"
          >
            {isLoadingUpdateQuestion ? "Updating..." : "Update Question"}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default EditQuestionPage;