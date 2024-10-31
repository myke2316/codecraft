import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateAnswerMutation,
  useFetchAnswerByIdQuery,
} from "../questionService";
import { useSelector } from "react-redux";
import { Editor } from "@monaco-editor/react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";

const languageOptions = ["html", "css", "javascript", "php"];

export default function EditAnswerPage() {
  const { questionId, answerId } = useParams();
  const navigate = useNavigate();
  const authorId = useSelector((state) => state.user.userDetails._id);
  const [updateAnswer, { isLoading: isUpdating }] = useUpdateAnswerMutation();
  const {
    data: answer,
    isLoading: isFetching,
    error,
  } = useFetchAnswerByIdQuery({ questionId, answerId });

  const [content, setContent] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([
    { language: "html", content: "" },
  ]);

  useEffect(() => {
    if (answer) {
      setContent(answer.content);
      setCodeBlocks(
        answer.codeBlocks.map((block) => ({
          ...block,
          language: block.language.toLowerCase(),
        }))
      );
    }
  }, [answer]);

  const handleCodeBlockChange = (index, field, value) => {
    const newCodeBlocks = [...codeBlocks];
    newCodeBlocks[index] = {
      ...newCodeBlocks[index],
      [field]: value.toLowerCase(),
    };
    setCodeBlocks(newCodeBlocks);
  };

  const addCodeBlock = () => {
    setCodeBlocks([...codeBlocks, { language: "html", content: "" }]);
  };

  const removeCodeBlock = (index) => {
    const newCodeBlocks = codeBlocks.filter((_, i) => i !== index);
    setCodeBlocks(newCodeBlocks);
  };

  const handleSubmit = async (e) => {
   
    e.preventDefault();
    try {
      const res = await updateAnswer({
        questionId,
        answerId,
        content,
        codeBlocks,
        authorId,
      }).unwrap();
    
      toast.success("Successfully posted answer.");
      navigate(`/qna/${authorId}/question/${questionId}`);
    } catch (err) {
      console.error("Failed to update answer:", err);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isFetching) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" align="center">
        Error loading answer details
      </Typography>
    );
  }

  return (
    <Paper elevation={3} className="p-6 max-w-4xl mx-auto mt-8">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1">
          Edit Answer
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
      </Box>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Answer Content"
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          fullWidth
          required
          className="mb-4"
        />
        {codeBlocks.map((block, index) => (
          <Paper key={index} elevation={2} className="p-4 mb-4">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <FormControl variant="outlined" className="w-1/3">
                <InputLabel>Language</InputLabel>
                <Select
                  value={block.language}
                  onChange={(e) =>
                    handleCodeBlockChange(index, "language", e.target.value)
                  }
                  label="Language"
                >
                  {languageOptions.map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => removeCodeBlock(index)}
                color="secondary"
                variant="outlined"
              >
                Remove
              </Button>
            </Box>
            <Editor
              height="200px"
              language={block.language}
              value={block.content}
              onChange={(value) =>
                handleCodeBlockChange(index, "content", value || "")
              }
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
              }}
            />
          </Paper>
        ))}
        <Box display="flex" justifyContent="space-between" mt={2} mb={4}>
          <Button
            startIcon={<AddIcon />}
            onClick={addCodeBlock}
            variant="contained"
            color="primary"
          >
            Add Code Block
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Answer"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
