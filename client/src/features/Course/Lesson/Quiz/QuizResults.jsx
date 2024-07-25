import { useSelector } from "react-redux";
import { useParams } from "react-router";

function QuizResults() {
  const userId = useSelector((state) => state.user.userDetails);
  const { lessonId, courseId } = useParams();
  const quizSubmissions= useSelector(
    (state) => state.userQuizSubmission.quizSubmissions
  );
  const course = quizSubmissions.courses.find(course => course.courseId === courseId);
  const lesson = course.lessons.find(lesson => lesson.lessonId === lessonId);
  const quiz = lesson.quizzes; // Array of quiz details for the specific lesson
  const score = quiz.reduce((acc, q) => acc + q.pointsEarned, 0);
  function handleNext() {
    // navigate(
    //   `/course/${courseId}/lesson/${lessonId}/codingActivity/${lesson.codingActivity[0]._id}`
    // );
    console.log("ACTIVITY HERE");
  }
  return (
    <div className="quiz-results">
      <h3>Your Score: {score} / {quiz.length * 2}</h3> {/* Assuming each question is out of 10 points */}
      <h4>Review Your Answers:</h4>
      <ul>
        {quiz.map((answer, index) => (
          <li key={index} className="review-answer">
            <p><strong>Question {index + 1}:</strong> {answer.question}</p>
            <p>Your Answer: {answer.selectedOption}</p>
            <p>
              Correct Answer:{" "}
              <span className={answer.correct ? "correct-answer" : "incorrect-answer"}>
                {answer.correctAnswer}
              </span>
            </p>
            <hr />
          </li>
        ))}
      </ul>
      <button onClick={handleNext} className="quiz-button">
        Proceed to Activity
      </button>
    </div>
  );
}

export default QuizResults;


