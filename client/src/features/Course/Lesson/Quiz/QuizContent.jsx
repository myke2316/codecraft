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
  Alert,
  CircularProgress,
  useMediaQuery,useTheme
} from "@mui/material";
import { toast } from "react-toastify";


const QuizContent = ({ quiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { courseId, lessonId, quizId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  const isLoading =
    isLoadingUpdateUserProgress ||
    isLoadingUpdateUserAnalytics ||
    isLoadingUpdateQuizSubmission ||
    isSubmitting;
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

  const quizSubmissions = useSelector(
    (state) => state.userQuizSubmission.quizSubmissions
  );
  const quizSubmission = quizSubmissions.courses.find(
    (course) => course.courseId === courseId
  );
  const lessonSubmission = quizSubmission?.lessons.find(
    (lesson) => lesson.lessonId === lessonId
  );

  const currentQuizQuestion = lessonSubmission?.quizzes.find(
    (q) => q.quizId === quizId
  );
  const isQuestionAnswered = currentQuizQuestion.selectedOption !== null;
  console.log(currentQuizQuestion);
  async function handleNext() {
    if (currentQuestionIndex < quiz.length - 1) {
      setStartTime(null);
      setTimer(0);
      navigate(
        `/course/${courseId}/lesson/${lessonId}/quiz/${
          quiz[currentQuestionIndex + 1]._id
        }`
      );
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
      navigate(`/course/${courseId}/lesson/${lessonId}/quiz/results`);
    }
  }

  async function handleSubmitAnswer() {
    if (isSubmitting) return;
    setIsSubmitting(true);
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
      try {
        // update progress
        const updateData = await updateUserProgress({
          userId,
          courseId,
          lessonId,
          quizId: quiz[currentQuestionIndex + 1]._id,
        }).unwrap();
        dispatch(updateCourseProgress(updateData));

        // update analytics
        const updateAnalyticsData = await updateUserAnalyticsMutation({
          userId,
          analyticsData: {
            coursesAnalytics: [
              {
                courseId,
                lessonsAnalytics: [
                  {
                    lessonId,
                    quizzesAnalytics: [
                      {
                        quizId: quiz[currentQuestionIndex]._id,
                        timeSpent: timer,
                        pointsEarned:
                          selectedOption === currentQuestion.correctAnswer
                            ? currentQuestion.points
                            : 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }).unwrap();
        dispatch(updateUserAnalytics(updateAnalyticsData));

        // update quiz submissions
        const correct =
          selectedOption === currentQuestion.correctAnswer ? true : false;
        const thisScore =
          selectedOption === currentQuestion.correctAnswer
            ? currentQuestion.points
            : 0;

        updateQuizSubmissionUtil(
          dispatch,
          updateUserQuizSubmission,
          userId,
          quizId,
          selectedOption,
          correct,
          thisScore,
          currentQuestion.correctAnswer
        );

        setStartTime(null);
        setTimer(0);
        navigate(
          `/course/${courseId}/lesson/${lessonId}/quiz/${
            quiz[currentQuestionIndex + 1]._id
          }`
        );

        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(
          newAnswers[currentQuestionIndex + 1]?.selectedOption || null
        );
      } catch (error) {
        console.error(error);
      
          toast.error("Please wait before submitting the answer")
     
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const score = calculateScore();
        const updateData = await updateUserProgress({
          userId,
          courseId,
          lessonId,
          quizId: quiz[currentQuestionIndex]._id,
        }).unwrap();
        dispatch(updateCourseProgress(updateData));

        const correct =
          selectedOption === currentQuestion.correctAnswer ? true : false;
        const thisScore =
          selectedOption === currentQuestion.correctAnswer
            ? currentQuestion.points
            : 0;
        updateQuizSubmissionUtil(
          dispatch,
          updateUserQuizSubmission,
          userId,
          quizId,
          selectedOption,
          correct,
          thisScore,
          currentQuestion.correctAnswer
        );

        // update analytics
        const updateAnalyticsData = await updateUserAnalyticsMutation({
          userId,
          analyticsData: {
            coursesAnalytics: [
              {
                courseId,
                lessonsAnalytics: [
                  {
                    lessonId,
                    quizzesAnalytics: [
                      {
                        quizId: quiz[currentQuestionIndex]._id,
                        timeSpent: timer,
                        pointsEarned:
                          selectedOption === currentQuestion.correctAnswer
                            ? currentQuestion.points
                            : 0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }).unwrap();
        dispatch(updateUserAnalytics(updateAnalyticsData));
        setStartTime(null);
        setTimer(0);
        setShowResults(true);
        navigate(`/course/${courseId}/lesson/${lessonId}/quiz/results`);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
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
      (answer) => answer?.selectedOption === answer?.correctAnswer
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
        p: isMobile ? 2 : 4,
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
      <Typography
        variant="h5"
        fontWeight="bold"
        mb={3}
        fontSize={isMobile ? "1rem" : "1.5rem"}
      >
        {currentQuestion?.question}
      </Typography>
      {isQuestionAnswered && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have already answered this question. Your selected answer was:{" "}
          {currentQuizQuestion.selectedOption}
        </Alert>
      )}
      {/* Options */}
      <RadioGroup
        value={
          isQuestionAnswered
            ? currentQuizQuestion.selectedOption
            : selectedOption
        }
        onChange={(e) => setSelectedOption(e.target.value)}
      >
        {currentQuestion?.options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option}
            control={<Radio color="primary" />}
            label={
              <Typography
                variant="body1"
                fontSize={isMobile ? "0.9rem" : "1rem"}
              >
                {option}
              </Typography>
            }
            sx={{
              mb: 2,
              borderRadius: 1,
              p: isMobile ? 1 : 2,
              "&:hover": { bgcolor: "#f0f0f0" },
            }}
            disabled={isQuestionAnswered || isLoading}
          />
        ))}
      </RadioGroup>

      {/* Button Group */}

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          mt: 4,
          gap: isMobile ? 2 : 0,
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0 || isLoading}
          fullWidth={isMobile}
        >
          Back
        </Button>
        {!isQuestionAnswered && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null || isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Submit Answer"
            )}
          </Button>
        )}
        {isQuestionAnswered && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={isLoading}
          >
            {currentQuestionIndex < quiz.length - 1 ? "Next" : "Finish Quiz"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QuizContent;
