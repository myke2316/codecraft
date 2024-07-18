function QuizResults({ answers, quiz, score, handleNextLesson }) {
  return (
    <div className="quiz-results">
      <h3>
        Your Score: {score} / {quiz.length}
      </h3>
      <h4>Review Your Answers:</h4>
      <ul>
        {answers.map((answer, index) => (
          <li key={index} className="review-answer">
            <p>
              <strong>Question {index + 1}:</strong> {answer.question}
            </p>
            <p>Your Answer: {answer.selectedOption}</p>
            <p>
              Correct Answer:{" "}
              <span
                className={
                  answer.selectedOption === answer.correctAnswer
                    ? "correct-answer"
                    : "incorrect-answer"
                }
              >
                {answer.correctAnswer}
              </span>
            </p>
            <hr />
          </li>
        ))}
      </ul>
      <button onClick={handleNextLesson} className="quiz-button">
        Proceed to Activity
      </button>
    </div>
  );
}
export default QuizResults;
