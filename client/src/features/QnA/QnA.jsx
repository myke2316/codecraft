import React from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Box,
} from "@mui/material";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";
import { useSelector } from "react-redux";


const QnA = () => {
  const userId = useSelector((state) => state.user.userDetails._id);
  return (
    <>
      <h1>Q&A Section</h1>
      
      <QuestionForm userId={userId} />
      <QuestionList userId={userId} />
    </>
  );
};

export default QnA;
