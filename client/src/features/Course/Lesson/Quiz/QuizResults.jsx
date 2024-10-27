import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import {
  Box,
  Typography,
  List,
  ListItem,
  Button,
  Divider,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

export default function QuizResults() {
  const { lessonId, courseId } = useParams();
  const navigate = useNavigate();

  const userProgress = useSelector(
    (state) => state.studentProgress.userProgress
  );
  const quizSubmissions = useSelector(
    (state) => state.userQuizSubmission.quizSubmissions
  );

  const courseProgress = userProgress?.coursesProgress.find(
    (course) => course.courseId === courseId
  );
  const lessonProgress = courseProgress?.lessonsProgress.find(
    (lesson) => lesson.lessonId === lessonId
  );
  const quizProgress = lessonProgress?.quizzesProgress || [];

  const allQuizzesFinished = quizProgress.every((quiz) => quiz.dateFinished);
  const hasActivity = lessonProgress?.activitiesProgress?.length > 0;

  const currentLessonIndex = courseProgress?.lessonsProgress.findIndex(
    (lesson) => lesson.lessonId === lessonId
  );
  const nextLessonProgress =
    courseProgress?.lessonsProgress[currentLessonIndex + 1];

  const course = quizSubmissions.courses.find(
    (course) => course.courseId === courseId
  );
  const lesson = course?.lessons.find((lesson) => lesson.lessonId === lessonId);
  const quizDetails = lesson?.quizzes || [];

  const totalScore = quizDetails.reduce((acc, q) => acc + q.pointsEarned, 0);
  const totalPossibleScore = quizDetails.length * 2;

  function handleNext() {
    if (hasActivity) {
      navigate(`/course/${courseId}/lesson/${lessonId}/activity/activityList`);
    } else if (nextLessonProgress) {
      navigate(`/course/${courseId}/lesson/${nextLessonProgress.lessonId}`);
    } else {
      navigate(`/course/${courseId}`);
    }
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Paper
        elevation={3}
        className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card className="h-full bg-white shadow-md">
              <CardContent>
                <Typography
                  variant="h4"
                  className="font-bold text-center mb-4 text-indigo-700"
                >
                  Quiz Results - 2pts each
                </Typography>
                <Box className="text-center mb-6">
                  <Typography
                    variant="h3"
                    className="font-bold text-indigo-900"
                  >
                    {totalScore} / {totalPossibleScore}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(totalScore / totalPossibleScore) * 100}
                    className="mt-2"
                  />
                </Box>
                {quizProgress.length > 0 ? (
                  <Typography
                    variant="h6"
                    className={`font-semibold text-center ${
                      allQuizzesFinished ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {allQuizzesFinished
                      ? "All quizzes completed!"
                      : "Some quizzes unfinished."}
                  </Typography>
                ) : (
                  <Typography
                    variant="h6"
                    className="font-semibold text-center text-red-600"
                  >
                    No quizzes available.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card className="bg-white shadow-md">
              <CardContent>
                <Typography
                  variant="h5"
                  className="font-semibold mb-4 text-indigo-700"
                >
                  Review Your Answers
                </Typography>
                <Box
                  className="overflow-y-auto pr-4"
                  sx={{
                    maxHeight: { xs: "400px", md: "600px" },
                    "&::-webkit-scrollbar": {
                      width: "0.4em",
                    },
                    "&::-webkit-scrollbar-track": {
                      boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
                      webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(0,0,0,.1)",
                      outline: "1px solid slategrey",
                    },
                  }}
                >
                  <List className="space-y-4">
                    {quizDetails.map((answer, index) => (
                      <ListItem
                        key={index}
                        className={`flex flex-col items-start p-4 rounded-lg ${
                          answer.correct ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <Typography variant="h6" className="font-semibold mb-2">
                          Question {index + 1}: {answer.question}
                        </Typography>
                        <Typography variant="body1" className="mb-1">
                          Your Answer: {answer.selectedOption}{" "}
                          {answer.correct ? (
                            <CheckCircleOutlineIcon className="text-green-600 ml-1" />
                          ) : (
                            <HighlightOffIcon className="text-red-600 ml-1" />
                          )}
                        </Typography>
                        <Typography variant="body1" className="font-medium">
                          Correct Answer: {answer.correctAnswer}
                        </Typography>
                        {index < quizDetails.length - 1 && (
                          <Divider className="w-full my-4" />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Box className="mt-8 text-center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            size="large"
            className="px-8 py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700"
          >
            {hasActivity
              ? "Proceed to Activity"
              : nextLessonProgress
              ? "Next Lesson"
              : "Return to Course"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
