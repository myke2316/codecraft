import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAddAnswerMutation,
  useFetchQuestionByIdMutation,
} from "../questionService";
import QuestionHeader from "./QuestionHeader";
import QuestionContent from "./QuestionContent";
import AnswerList from "./AnswerList";
import AnswerForm from "./AnswerForm";

const QuestionDetail = () => {
  const { questionId, userId } = useParams();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [codeBlocks, setCodeBlocks] = useState([{ language: "", content: "" }]);
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState(null);

  const [
    fetchQuestion,
    { isLoading, data: fetchedQuestion, error: fetchError },
  ] = useFetchQuestionByIdMutation();

  useEffect(() => {
    const fetchQuestionById = async () => {
      try {
        const data = await fetchQuestion(questionId).unwrap();
        setQuestion(data);
      } catch (err) {
        setError(err.message || "Failed to fetch question");
      }
    };

    fetchQuestionById();
  }, [fetchQuestion, questionId]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [addAnswer, { isLoading: isLoadingAddAnswer }] = useAddAnswerMutation();

  const handleSubmitAnswer = async () => {
    try {
      const data = await addAnswer({
        questionId,
        content: answerContent,
        codeBlocks,
        authorId: userId,
      }).unwrap();
      handleClose();
      console.log(data);
    } catch (error) {
      console.error("Failed to add answer:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      const data = await fetchQuestion(questionId).unwrap();
      setQuestion(data);
    } catch (err) {
      setError(err.message || "Failed to fetch question");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-xl font-bold">Error: {error}</div>;
  }

  if (!question) {
    return <div className="text-xl font-bold">Question not found</div>;
  }
  
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <QuestionHeader
        question={question}
        navigate={navigate}
        currentUserId={userId}
      />
      <button
        onClick={handleClickOpen}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 flex items-center"
      >
        <span className="material-icons mr-2">add_circle</span>
        Add Answer
      </button>
      <button
        onClick={handleRefresh}
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 flex items-center"
      >
        <span className="material-icons mr-2">refresh</span>
        Refresh
      </button>
      <QuestionContent question={question} />
      <h2 className="text-2xl font-semibold mb-4">Answers</h2>
      <AnswerList
        answers={question.answers}
        currentUserId={userId}
        questionAuthorId={question.author._id}
        question = {question}
      />
      <AnswerForm
        open={open}
        handleClose={handleClose}
        handleSubmitAnswer={handleSubmitAnswer}
        answerContent={answerContent}
        setAnswerContent={setAnswerContent}
        codeBlocks={codeBlocks}
        setCodeBlocks={setCodeBlocks}
      />
    </div>
  );
};

export default QuestionDetail;
