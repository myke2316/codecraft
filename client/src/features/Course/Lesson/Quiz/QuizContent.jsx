// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import "./quiz.css";
// import { useDispatch, useSelector } from "react-redux";
// import { useUpdateUserProgressMutation } from "../../../Student/studentCourseProgressService";
// import { updateCourseProgress } from "../../../Student/studentCourseProgressSlice";
// import QuizResults from "./QuizResults";
// import { updateUserAnalytics } from "../../../Student/userAnalyticsSlice";
// import { useUpdateUserAnalyticsMutation } from "../../../Student/userAnalyticsService";
// import { formatTime } from "../../../../utils/formatTime";
// import { useUpdateUserQuizSubmissionMutation } from "../../Quiz/quizSubmissionService";
// import { updateQuizSubmissionUtil } from "../../../../utils/quizSubmissionUtil";
// import ActivityLists from "../Activity/ActivityLists";

// const QuizContent = ({ quiz }) => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [answers, setAnswers] = useState([]);
//   const [showResults, setShowResults] = useState(false);
//   const { courseId, lessonId, quizId } = useParams();

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const user = useSelector((state) => state.user.userDetails);
//   const userId = user._id;
//   const [updateUserProgress, { isLoading: isLoadingUpdateUserProgress }] =
//     useUpdateUserProgressMutation();
//   const [
//     updateUserAnalyticsMutation,
//     { isLoading: isLoadingUpdateUserAnalytics },
//   ] = useUpdateUserAnalyticsMutation();
//   const [
//     updateUserQuizSubmission,
//     { isLoading: isLoadingUpdateQuizSubmission },
//   ] = useUpdateUserQuizSubmissionMutation();

//   const quizSubmissionData = useSelector(
//     (state) => state.userQuizSubmission.quizSubmissions
//   );
  

//   useEffect(() => {
//     const index = quiz.findIndex((q) => q._id === quizId);
//     if (index !== -1) {
//       setCurrentQuestionIndex(index);
//       setSelectedOption(answers[index]?.selectedOption || null);
//       setStartTime(new Date().getTime());
//     }
//   }, [quizId, quiz, answers]);

//   //TIMER==================
//   const [timer, setTimer] = useState(0); // Add a timer state
//   const [startTime, setStartTime] = useState(null); // Add a start time state
//   const formattedTime = formatTime(timer); //nasa utils ang formatTimer na function

//   useEffect(() => {
//     if (startTime) {
//       const intervalId = setInterval(() => {
//         setTimer((prevTimer) => prevTimer + 1);
//       }, 1000);

//       if (showResults) {
//         clearInterval(intervalId);
//       }
//       return () => clearInterval(intervalId);
//     }
//   }, [startTime, showResults]);
//   //====================

//   const currentQuestion = quiz[currentQuestionIndex];
//   const courses = useSelector((state) => state.course.courseData);
//   const course = courses.find((course) => course._id === courseId);
//   const lesson = course.lessons.find((lesson) => lesson._id === lessonId);

//   const [score, setScore] = useState(0); // New state for score

//   async function handleNext() {
//     const newAnswers = [...answers];
//     newAnswers[currentQuestionIndex] = {
//       question: currentQuestion.question,
//       selectedOption,
//       correctAnswer: currentQuestion.correctAnswer,
//     };
//     setAnswers(newAnswers);

//     if (selectedOption === currentQuestion.correctAnswer) {
//       setScore(score + currentQuestion.points);
//     }

//     if (currentQuestionIndex < quiz.length - 1) {
//       try {
//         //update progress
//         const updateData = await updateUserProgress({
//           userId,
//           courseId,
//           lessonId,
//           quizId: quiz[currentQuestionIndex + 1]._id,
//         }).unwrap();
//         dispatch(updateCourseProgress(updateData));

//         //update analytics
//         const updateAnalyticsData = await updateUserAnalyticsMutation({
//           userId,
//           analyticsData: {
//             coursesAnalytics: [
//               {
//                 courseId,
//                 lessonsAnalytics: [
//                   {
//                     lessonId,
//                     quizzesAnalytics: [
//                       {
//                         quizId: quiz[currentQuestionIndex]._id,
//                         timeSpent: timer,
//                         pointsEarned:
//                           selectedOption === currentQuestion.correctAnswer
//                             ? currentQuestion.points
//                             : 0,
//                       },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//         }).unwrap();
//         // console.log(updateAnalyticsData);
//         dispatch(updateUserAnalytics(updateAnalyticsData));

//         //update quiz submissions
//         const correct =
//           selectedOption === currentQuestion.correctAnswer ? true : false;
//         const thisScore =
//           selectedOption === currentQuestion.correctAnswer
//             ? currentQuestion.points
//             : 0;

//         updateQuizSubmissionUtil(
//           dispatch,
//           updateUserQuizSubmission,
//           userId,
//           quizId,
//           selectedOption,
//           correct,
//           thisScore,
//           currentQuestion.correctAnswer // ito =<<<<<<
//         );

//         setStartTime(null);
//         setTimer(0);
//         navigate(
//           `/course/${courseId}/lesson/${lessonId}/quiz/${
//             quiz[currentQuestionIndex + 1]._id
//           }`
//         );

//         setCurrentQuestionIndex(currentQuestionIndex + 1);
//         setSelectedOption(
//           newAnswers[currentQuestionIndex + 1]?.selectedOption || null
//         );
//       } catch (error) {
//         console.error(error);
//       }
//     } else {
//       try {
//         const score = calculateScore();
//         const updateData = await updateUserProgress({
//           userId,
//           courseId,
//           lessonId,
//           quizId: quiz[currentQuestionIndex]._id,
//         }).unwrap();
//         dispatch(updateCourseProgress(updateData));

//         const correct =
//           selectedOption === currentQuestion.correctAnswer ? true : false;
//         const thisScore =
//           selectedOption === currentQuestion.correctAnswer
//             ? currentQuestion.points
//             : 0;
//         updateQuizSubmissionUtil(
//           dispatch,
//           updateUserQuizSubmission,
//           userId,
//           quizId,
//           selectedOption,
//           correct,
//           thisScore,
//           currentQuestion.correctAnswer // ito =<<<<<<
//         );

//         //update analytics
//         const updateAnalyticsData = await updateUserAnalyticsMutation({
//           userId,
//           analyticsData: {
//             coursesAnalytics: [
//               {
//                 courseId,
//                 lessonsAnalytics: [
//                   {
//                     lessonId,
//                     quizzesAnalytics: [
//                       {
//                         quizId: quiz[currentQuestionIndex]._id,
//                         timeSpent: timer,
//                         pointsEarned:
//                           selectedOption === currentQuestion.correctAnswer
//                             ? currentQuestion.points
//                             : 0,
//                       },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//         }).unwrap();
//         console.log(updateAnalyticsData);
//         dispatch(updateUserAnalytics(updateAnalyticsData));
//         setStartTime(null);
//         setTimer(0);
//         setShowResults(true);
//         navigate(`/course/${courseId}/lesson/${lessonId}/quiz/results`);
//       } catch (error) {
//         console.error(error);
//       }
//     }
//   }

//   const handleBack = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//       setSelectedOption(answers[currentQuestionIndex - 1]?.selectedOption);
//       navigate(
//         `/course/${courseId}/lesson/${lessonId}/quiz/${
//           quiz[currentQuestionIndex - 1]._id
//         }`
//       );
//     }
//   };

//   function calculateScore() {
//     return answers.filter(
//       (answer) => answer.selectedOption === answer.correctAnswer
//     ).length;
//   }



//   const progressBarWidth = `${
//     ((currentQuestionIndex + 1) / quiz.length) * 100
//   }%`;

//   if (showResults) {
//     navigate(`/course/${courseId}/lesson/${lessonId}/quiz/results`)
//     // const score = calculateScore();
//     // return (
//     //   <QuizResults
//     //     answers={answers}
//     //     score={score}
//     //     quiz={quiz}
//     //     handleNextLesson={handleNextLesson}
//     //   />
//     // );

//   }

//   return (
//     <div className="quiz-content">
//       <div className="progress-bar">
//         <div style={{ width: progressBarWidth }} />
//       </div>
//       <h3>{currentQuestion.question}</h3>
//       {currentQuestion.options.map((option, index) => (
//         <div key={index}>
//           <input
//             type="radio"
//             value={option}
//             checked={selectedOption === option}
//             onChange={() => setSelectedOption(option)}
//           />
//           <label>{option}</label>
//         </div>
//       ))}
//       <div className="button-group">
//         <button
//           onClick={handleBack}
//           disabled={currentQuestionIndex === 0}
//           className="quiz-button"
//         >
//           Back
//         </button>
//         <button
//           onClick={handleNext}
//           disabled={selectedOption === null}
//           className="quiz-button"
//         >
//           {currentQuestionIndex < quiz.length - 1 ? "Next" : "Submit"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuizContent;

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
  const lessonData = courseData?.lessons.find((lesson) => lesson._id === lessonId);

  const [score, setScore] = useState(0); // New state for score

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
