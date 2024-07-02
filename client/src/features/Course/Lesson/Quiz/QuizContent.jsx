import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

function QuizContent() {
  const { courseId, lessonId, quizId } = useParams();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);
  const course = courses.find((course) => course._id === courseId);
  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
  const quizzes = lesson.quiz;
  const currentIndex = quizzes.findIndex((quiz) => quiz._id === quizId);
  const quiz = quizzes[currentIndex];

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleOptionClick = (option) => {
    setSelectedAnswer(option);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      navigate(
        `/course/${courseId}/lesson/${lessonId}/quiz/${quizzes[currentIndex - 1]._id}`,
        {
          replace: true,
        }
      );
    }
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      navigate(`/course/${courseId}/lesson/${lessonId}/quiz/${quizzes[currentIndex + 1]._id}`, {
        replace: true,
      });
    } else {
      // Proceed to coding activity when all quizzes are completed
      navigate(`/course/${courseId}/lesson/${lessonId}/activity/${lesson.codingActivity[0]._id}`, { replace: true });
    }
  };

  return (
    <div>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">
          {lesson.title}
        </h1>
        <h1> {quiz.question}</h1>
        <hr />
        <div>
          {quiz.options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={() => handleOptionClick(option)}
              />
              <span className="ml-2">{option}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext}>Next</button>
          <button>Submit</button> {/* You can handle the submit function later */}
        </div>
      </div>
    </div>
  );
}

export default QuizContent;