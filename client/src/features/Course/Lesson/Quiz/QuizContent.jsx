import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserProgressMutation } from "../../../Student/studentCourseProgressService";
import { updateCourseProgress } from "../../../Student/studentCourseProgressSlice";
import QuizResults from "./QuizResults";
import { updateUserAnalytics } from "../../../Student/userAnalyticsSlice";
import { useUpdateUserAnalyticsMutation } from "../../../Student/userAnalyticsService";
import { formatTime } from "../../../../utils/formatTime";
import { useUpdateUserQuizSubmissionMutation } from "../../Quiz/quizSubmissionService";
import { updateQuizSubmissionUtil } from "../../../../utils/quizSubmissionUtil";
import "./quiz.css";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  LinearProgress,
} from "@mui/material";

const QuizContent = ({ quiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { courseId, lessonId, quizId } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.userDetails);
  const userId = user._id;
  const [updateUserProgress, { isLoading: isLoadingUpdateUserProgress }] =
    useUpdateUserProgressMutation();
  const [
    updateUserAnalyticsMutation,
    { isLoading: isLoadingUpdateUserAnalytics },
  ] = useUpdateUserAnalyticsMutation();
  const [
    updateUserQuizSubmission,
    { isLoading: isLoadingUpdateQuizSubmission },
  ] = useUpdateUserQuizSubmissionMutation();

  const quizSubmissionData = useSelector(
    (state) => state.userQuizSubmission.quizSubmissions
  );

  const course = quizSubmissionData.courses.find(
    (course) => course.courseId === courseId
  );
  const lesson = course?.lessons.find((lesson) => lesson.lessonId === lessonId);
  const quizzes = lesson?.quizzes || [];
  
  useEffect(() => {
    const index = quiz.findIndex((q) => q._id === quizId);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
      setSelectedOption(answers[index]?.selectedOption || null);
      setStartTime(new Date().getTime());
    }
  }, [quizId, quiz, answers]);


  // Check if all quizzes are answered
  useEffect(() => {
    if (quizzes.length > 0 && quizzes.every((q) => q.selectedOption)) {
      navigate(`/course/${courseId}/lesson/${lessonId}/quiz/results`);
    }
    console.log(quizzes)
  }, [quizzes, navigate, courseId, lessonId]);

  // Timer logic
  const [timer, setTimer] = useState(0); // Add a timer state
  const [startTime, setStartTime] = useState(null); // Add a start time state
  const formattedTime = formatTime(timer); // formatTime function from utils

  useEffect(() => {
    if (startTime) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);

      if (showResults) {
        clearInterval(intervalId);
      }
      return () => clearInterval(intervalId);
    }
  }, [startTime, showResults]);

  const currentQuestion = quiz[currentQuestionIndex];
  const courses = useSelector((state) => state.course.courseData);
  const courseData = courses.find((course) => course._id === courseId);
  const lessonData = courseData?.lessons.find(
    (lesson) => lesson._id === lessonId
  );

  const [score, setScore] = useState(0); // New state for score
  
  async function handleSubmit(finalAnswers) {
    try {
      // Update user progress only at the end of the quiz
      const updateData = await updateUserProgress({
        userId,
        courseId,
        lessonId,
        quizId: quiz[currentQuestionIndex]._id,
      }).unwrap();
      dispatch(updateCourseProgress(updateData));

      // Update analytics and quiz submissions for all questions
      const analyticsData = {
        coursesAnalytics: [{
          courseId,
          lessonsAnalytics: [{
            lessonId,
            quizzesAnalytics: finalAnswers.map((answer, index) => ({
              quizId: quiz[index]._id,
              timeSpent: timer, // This will be the total time for the entire quiz
              pointsEarned: answer.selectedOption === answer.correctAnswer ? quiz[index].points : 0,
            })),
          }],
        }],
      };

      const updateAnalyticsData = await updateUserAnalyticsMutation({
        userId,
        analyticsData,
      }).unwrap();
      dispatch(updateUserAnalytics(updateAnalyticsData));

      // Update quiz submissions for all questions
      finalAnswers.forEach((answer, index) => {
        const correct = answer.selectedOption === answer.correctAnswer;
        const thisScore = correct ? quiz[index].points : 0;
        updateQuizSubmissionUtil(
          dispatch,
          updateUserQuizSubmission,
          userId,
          quiz[index]._id,
          answer.selectedOption,
          correct,
          thisScore,
          answer.correctAnswer
        );
      });

      setStartTime(null);
      setTimer(0);
      setShowResults(true);
      navigate(`/course/${courseId}/lesson/${lessonId}/quiz/results`);
    } catch (error) {
      console.error(error);
    }
  }



  async function handleNext() {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      question: currentQuestion.question,
      selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
    };
    setAnswers(newAnswers);

    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(score + currentQuestion.points);
    }

    if (currentQuestionIndex < quiz.length - 1) {
      setStartTime(null);
      setTimer(0);
      navigate(`/course/${courseId}/lesson/${lessonId}/quiz/${quiz[currentQuestionIndex + 1]._id}`);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(newAnswers[currentQuestionIndex + 1]?.selectedOption || null);
    } else {
      await handleSubmit(newAnswers);
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[currentQuestionIndex - 1]?.selectedOption);
      navigate(
        `/course/${courseId}/lesson/${lessonId}/quiz/${
          quiz[currentQuestionIndex - 1]._id
        }`
      );
    }
  };

  function calculateScore() {
    return answers.filter(
      (answer) => answer.selectedOption === answer.correctAnswer
    ).length;
  }

  const progressBarWidth = `${
    ((currentQuestionIndex + 1) / quiz.length) * 100
  }%`;

  if (showResults) {
    navigate(`/course/${courseId}/lesson/${lessonId}/quiz/results`);
  }

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: "600px",
        margin: "0 auto",
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      {/* Progress Bar */}
      
      <div className="progress-bar">
        <div style={{ width: progressBarWidth }} />
      </div>
      {/* Question */}
      <Typography variant="h5" fontWeight="bold" mb={3}>
        {currentQuestion?.question}
      </Typography>

      {/* Options */}
      <RadioGroup
        value={selectedOption}
        onChange={(e) => setSelectedOption(e.target.value)}
      >
        {currentQuestion?.options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option}
            control={<Radio color="primary" />}
            label={<Typography variant="body1">{option}</Typography>}
            sx={{
              mb: 2,
              borderRadius: 1,
              p: 2,
              "&:hover": { bgcolor: "#f0f0f0" },
            }}
          />
        ))}
      </RadioGroup>

      {/* Button Group */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          disabled={selectedOption === null}
        >
          {currentQuestionIndex < quiz.length - 1 ? "Next" : "Submit"}
        </Button>
      </Box>
    </Box>
  );
};

export default QuizContent;
