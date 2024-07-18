import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./quiz.css";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUserProgressMutation } from "../../../Student/studentCourseProgressService";
import { updateCourseProgress } from "../../../Student/studentCourseProgressSlice";
import QuizResults from "./QuizResults";

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

  useEffect(() => {
    const index = quiz.findIndex((q) => q._id === quizId);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
      setSelectedOption(answers[index]?.selectedOption || null);
    }
  }, [quizId, quiz, answers]);

  const currentQuestion = quiz[currentQuestionIndex];

  const courses = useSelector((state) => state.course.courseData);
  const course = courses.find((course) => course._id === courseId);
  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);

  async function handleNext() {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      question: currentQuestion.question,
      selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
    };
    setAnswers(newAnswers);

    if (currentQuestionIndex < quiz.length - 1) {
      try {
        const updateData = await updateUserProgress({
          userId,
          courseId,
          lessonId,
          quizId: quiz[currentQuestionIndex + 1]._id,
        }).unwrap();
        dispatch(updateCourseProgress(updateData));
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
      }
    } else {
      try {
        const updateData = await updateUserProgress({
          userId,
          courseId,
          lessonId,
          quizId: quiz[currentQuestionIndex]._id,
        }).unwrap();
        dispatch(updateCourseProgress(updateData));
        setShowResults(true);
        navigate(`/course/${courseId}/lesson/${lessonId}/quiz/results`);
      } catch (error) {
        console.error(error);
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

  const calculateScore = () => {
    return answers.filter(
      (answer) => answer.selectedOption === answer.correctAnswer
    ).length;
  };

  function handleNextLesson() {
    navigate(
      `/course/${courseId}/lesson/${lessonId}/codingActivity/${lesson.codingActivity[0]._id}`
    );
  }

  const progressBarWidth = `${
    ((currentQuestionIndex + 1) / quiz.length) * 100
  }%`;

  if (showResults) {
    const score = calculateScore();
    return (
      <QuizResults
        answers={answers}
        score={score}
        quiz={quiz}
        handleNextLesson={handleNextLesson}
      />
    );
  }

  return (
    <div className="quiz-content">
      <div className="progress-bar">
        <div style={{ width: progressBarWidth }} />
      </div>
      <h3>{currentQuestion.question}</h3>
      {currentQuestion.options.map((option, index) => (
        <div key={index}>
          <input
            type="radio"
            value={option}
            checked={selectedOption === option}
            onChange={() => setSelectedOption(option)}
          />
          <label>{option}</label>
        </div>
      ))}
      <div className="button-group">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="quiz-button"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className="quiz-button"
        >
          {currentQuestionIndex < quiz.length - 1 ? "Next" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default QuizContent;
