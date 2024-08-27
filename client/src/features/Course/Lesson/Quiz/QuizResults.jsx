import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { Box, Typography, List, ListItem, Button, Divider, Paper } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
function QuizResults() {
  const userId = useSelector((state) => state.user.userDetails);
  const { lessonId, courseId } = useParams();
  const quizSubmissions = useSelector(
    (state) => state.userQuizSubmission.quizSubmissions
  );
  const course = quizSubmissions.courses.find(
    (course) => course.courseId === courseId
  );
  const lesson = course.lessons.find((lesson) => lesson.lessonId === lessonId);
  const quiz = lesson.quizzes; // Array of quiz details for the specific lesson
  const score = quiz.reduce((acc, q) => acc + q.pointsEarned, 0);
  const navigate = useNavigate();
  function handleNext() {
    navigate(`/course/${courseId}/lesson/${lessonId}/activity/activityList`);
  }
  return (
    <Paper
      sx={{
        p: 4,
        width: '100%',
        maxWidth: '600px', // Adjusting maxWidth to create a more boxy appearance
        margin: '0 auto',
        boxShadow: 4,
        borderRadius: 2, // Slightly reduce the border radius for a more boxy look
        bgcolor: 'background.paper',
        minHeight: '80vh', // Ensure height is consistent with a boxy layout
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Score Display */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quiz Results
        </Typography>
        <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
          Your Score: {score} / {quiz.length * 2}
        </Typography>
      </Box>

      {/* Review List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="h6" fontWeight="medium" mb={3}>
          Review Your Answers:
        </Typography>
        <List>
          {quiz.map((answer, index) => (
            <ListItem
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                mb: 2,
                p: 2,
                bgcolor: answer.correct ? '#e0f7fa' : '#ffebee',
                borderRadius: 1, // Make each item boxier
              }}
            >
              <Typography variant="h6" gutterBottom>
                <strong>Question {index + 1}:</strong> {answer.question}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Your Answer: {answer.selectedOption}{" "}
                {answer.correct ? (
                  <CheckCircleOutlineIcon sx={{ color: 'green', ml: 1 }} />
                ) : (
                  <HighlightOffIcon sx={{ color: 'red', ml: 1 }} />
                )}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Correct Answer:{" "}
                <span style={{ fontWeight: 'bold' }}>
                  {answer.correctAnswer}
                </span>
              </Typography>
              <Divider sx={{ my: 2, width: '100%' }} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Proceed Button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          size="large"
        >
          Proceed to Activity
        </Button>
      </Box>
    </Paper>
    // <div className="quiz-results">
    //   <h3>
    //     Your Score: {score} / {quiz.length * 2}
    //   </h3>{" "}
    //   {/* Assuming each question is out of 10 points */}
    //   <h4>Review Your Answers:</h4>
    //   <ul>
    //     {quiz.map((answer, index) => (
    //       <li key={index} className="review-answer">
    //         <p>
    //           <strong>Question {index + 1}:</strong> {answer.question}
    //         </p>
    //         <p>Your Answer: {answer.selectedOption}</p>
    //         <p>
    //           Correct Answer:{" "}
    //           <span
    //             className={
    //               answer.correct ? "correct-answer" : "incorrect-answer"
    //             }
    //           >
    //             {answer.correctAnswer}
    //           </span>
    //         </p>
    //         <hr />
    //       </li>
    //     ))}
    //   </ul>
    //   <button onClick={handleNext} className="quiz-button">
    //     Proceed to Activity
    //   </button>
    // </div>
  );
}

export default QuizResults;
