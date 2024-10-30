import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAddAnswerMutation,
  useFetchQuestionByIdMutation,
} from "../questionService";
import QuestionHeader from "./QuestionHeader";
import QuestionContent from "./QuestionContent";
import AnswerList from "./AnswerList";
import AnswerForm from "./AnswerForm";
import { Button, CircularProgress, Typography, Box } from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useDeleteQuestionMutation } from "../questionService";
import { toast } from "react-toastify";
const QuestionDetail = () => {
  const { questionId, userId } = useParams();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState(null);
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [fetchQuestion, { isLoading }] = useFetchQuestionByIdMutation();
  const [addAnswer, { isLoading: isLoadingAddAnswer }] = useAddAnswerMutation();
  const handleDelete = async () => {
    try {
      await deleteQuestion(question._id).unwrap();
      navigate(-1); // Redirect back after deletion
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };
  const fetchQuestionData = useCallback(async () => {
    try {
      const data = await fetchQuestion(questionId).unwrap();
      setQuestion(data);
    } catch (err) {
      setError(err.message || "Failed to fetch question");
    }
  }, [fetchQuestion, questionId]);

  useEffect(() => {
    fetchQuestionData();
  }, [fetchQuestionData]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Reset form state when closing the form
    setAnswerContent("");
    setCodeBlocks([{ language: "html", content: "" }]);
  };

  const handleSubmitAnswer = async (values, { resetForm }) => {
    try {
      await addAnswer({
        questionId,
        content: values.answerContent,
        codeBlocks: values.codeBlocks,
        authorId: userId,
      }).unwrap();
      handleClose();
      fetchQuestionData();
      resetForm();
      toast.success("Successfully added answer.");
    } catch (error) {
      console.error("Failed to add answer:", error);
      toast.error("Failed to add an answer.");
    }
  };

  if (isLoading) {
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h5" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (!question) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Typography variant="h5">Question not found</Typography>
      </Box>
    );
  }
  
  return (
    <Box className=" px-7 max-w-8xl mx-auto my-8">
      {/* <QuestionHeader question={question} currentUserId={userId}/> */}
      <QuestionContent
        question={question}
        handleClickOpen={handleClickOpen}
        fetchQuestionData={fetchQuestionData}
        currentUserId={userId}
      />

      <AnswerList
        fetchQuestionData={fetchQuestionData}
        answers={question.answers}
        currentUserId={userId}
        questionAuthorId={question.author._id}
        question={question}
      />
      <AnswerForm
        open={open}
        handleClose={handleClose}
        handleSubmitAnswer={handleSubmitAnswer}
        answerContent={answerContent}
        setAnswerContent={setAnswerContent}
        codeBlocks={codeBlocks}
        setCodeBlocks={setCodeBlocks}
        isLoadingAddAnswer={isLoadingAddAnswer}
      />
    </Box>
  );
};

export default QuestionDetail;
