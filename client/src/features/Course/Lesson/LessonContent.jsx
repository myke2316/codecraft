import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Button,
  Grid,
  IconButton,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  Description,
  Quiz as QuizIcon,
  Code,
  Lock,
  CheckCircle,
  AccessTime,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const theme = createTheme({
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
  palette: {
    primary: {
      main: "#4F46E5", // indigo-600
    },
    secondary: {
      main: "#7C3AED", // purple-600
    },
  },
});

function LessonContent() {
  const { courseId, lessonId } = useParams();
  const quizSubmissions = useSelector(
    (state) => state.userQuizSubmission.quizSubmissions
  );
  const quizSubmission = quizSubmissions.courses.find(
    (course) => course.courseId === courseId
  );
  const lessonSubmission = quizSubmission?.lessons.find((lesson) => lesson.lessonId === lessonId);
 
  console.log(lessonSubmission)
  const courses = useSelector((state) => state.course.courseData);
  const userProgress = useSelector(
    (state) => state.studentProgress.userProgress
  );

  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    documents: true,
    quiz: true,
    activities: true,
  });

  if (!courses || !userProgress)
    return (
      <Box className="flex justify-center items-center h-screen">
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );

  const course = courses.find((course) => course._id === courseId);
  const lesson = course?.lessons.find((lesson) => lesson._id === lessonId);

  if (!course || !lesson)
    return (
      <Box className="flex justify-center items-center h-screen">
        <Typography variant="h6">Lesson not found</Typography>
      </Box>
    );

  const documents = lesson.documents || [];
  const quiz = lesson.quiz;
  const activities = lesson.activities || [];

  const lessonProgress = userProgress.coursesProgress
    .find((cp) => cp.courseId.toString() === courseId)
    ?.lessonsProgress.find((lp) => lp.lessonId.toString() === lessonId);

  if (!lessonProgress)
    return (
      <Box className="flex justify-center items-center h-screen">
        <Typography variant="h6">Lesson progress not found</Typography>
      </Box>
    );

  const completedDocuments = lessonProgress.documentsProgress.filter(
    // (dp) => !dp.locked
    (dp) => dp.dateFinished !== null
  ).length;
  const completedQuiz = lessonProgress.quizzesProgress.filter(
    (dp) => dp.dateFinished !== null
  ).length;

  const completedActivities = lessonProgress.activitiesProgress.filter(
    (dp) => dp.dateFinished !== null
  ).length;

  const totalDocuments = lesson.documents.length;
  const totalQuizzes = 1;
  const totalActivities = lesson.activities.length;
  const totalItems = totalDocuments + totalQuizzes + totalActivities;
  const completedItems =
    completedDocuments + completedQuiz + completedActivities;
  const progressPercentage = (completedItems / totalItems) * 100;
  const quizProgress = lessonProgress.quizzesProgress[0];
  const quizScore = quizProgress?.locked
    ? "Locked"
    : `${quizProgress?.pointsEarned} Points Earned`;


  const quizAnswerCheck = lessonSubmission.quizzes.every(q => q.selectedOption !== null)
  console.log(quizAnswerCheck)

  const handleClick = (id) => navigate(`document/${id}`);
  
  const handleQuizClick = () => navigate(`quiz/${quiz[0]._id}`);
  const handleActivityClick = (id) => navigate(`activity/${id}`);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="p-8 bg-gray-100 min-h-screen font-sans">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 overflow-hidden shadow-md">
            <CardContent sx={{ padding: { xs: 2, sm: 3, md: 4 } }}>
              <Box
                component="div"
                sx={{
                  display: "block",
                  width: "100%",
                  marginBottom: { xs: 2, sm: 3 },
                  fontWeight: "bold",
                  color: "gray.800",
                  fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2rem" },
                  wordBreak: "break-word",
                  lineHeight: 1.3,
                  whiteSpace: "normal", // Ensures it wraps onto new lines if needed
                  textAlign: "center", // Optional: centers the text
                }}
              >
                {lesson.title}
              </Box>

              <Typography
                variant="subtitle1"
                sx={{
                  marginBottom: 2,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: "600",
                }}
              >
                Overall Progress
              </Typography>

              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: { xs: 6, sm: 8 },
                  borderRadius: "4px",
                }}
                color="secondary"
              />

              <Typography
                variant="body2"
                sx={{
                  marginTop: 1,
                  textAlign: "right",
                  color: "gray.600",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                {Math.round(progressPercentage)}%
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        <Grid container spacing={4}>
          {/* Documents */}
          <Grid item xs={12}>
            <Card className="overflow-hidden shadow-md">
              <CardContent>
                <Box className="flex justify-between items-center mb-4">
                  <Typography
                    variant="h5"
                    className="font-semibold text-gray-700"
                  >
                    Documents
                  </Typography>
                  <IconButton
                    onClick={() => toggleSection("documents")}
                    size="small"
                  >
                    {expandedSections.documents ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </IconButton>
                </Box>
                <AnimatePresence>
                  {expandedSections.documents && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                      }}
                    >
                      {documents.length > 0 ? (
                        documents.map((document) => {
                          const docProgress =
                            lessonProgress.documentsProgress.find(
                              (dp) =>
                                dp.documentId.toString() ===
                                document._id.toString()
                            );
                          return (
                            <motion.div
                              key={document._id}
                              variants={listItemVariants}
                              transition={{ duration: 0.3 }}
                            >
                              <Box
                                className={`flex flex-col sm:flex-row items-start p-4 rounded-lg mb-4 transition-all duration-300 ${
                                  docProgress?.locked
                                    ? "bg-gray-200"
                                    : "bg-white hover:bg-gray-50"
                                } shadow-sm`}
                              >
                                <Description className="mr-4 text-blue-500" />
                                <Box className="flex-1">
                                  <Typography
                                    variant="subtitle1"
                                    className="font-semibold overflow-hidden whitespace-nowrap text-ellipsis"
                                    title={document.title} // Show full title on hover
                                  >
                                    {document.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    className="flex items-center text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis"
                                    title={
                                      docProgress?.locked
                                        ? "Locked"
                                        : docProgress?.dateFinished
                                        ? "Completed"
                                        : "In Progress"
                                    } // Show full status on hover
                                  >
                                    {docProgress?.locked ? (
                                      <>
                                        <Lock className="w-4 h-4 mr-1" /> Locked
                                      </>
                                    ) : docProgress?.dateFinished ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                        Completed
                                      </>
                                    ) : (
                                      <>
                                        <AccessTime className="w-4 h-4 mr-1 text-yellow-500" />
                                        In Progress
                                      </>
                                    )}
                                  </Typography>
                                </Box>
                                <Button
                                  variant="contained"
                                  color={
                                    docProgress?.locked ? "inherit" : "primary"
                                  }
                                  onClick={
                                    docProgress?.locked
                                      ? null
                                      : () => handleClick(document._id)
                                  }
                                  disabled={docProgress?.locked}
                                  className="transition-all duration-300 hover:scale-105 w-full sm:w-auto mt-2 sm:mt-0"
                                >
                                  {docProgress?.locked
                                    ? "Locked"
                                    : "Open Document"}
                                </Button>
                              </Box>
                            </motion.div>
                          );
                        })
                      ) : (
                        <Typography variant="body2" className="text-gray-500">
                          No documents available.
                        </Typography>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </Grid>

          {/* Quiz */}
          {quiz.length > 0 && (
  <Grid item xs={12} md={6}>
    <Card className="overflow-hidden shadow-md h-full">
      <CardContent>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h5" className="font-semibold text-gray-700">
            Quiz
          </Typography>
          <IconButton onClick={() => toggleSection("quiz")} size="small">
            {expandedSections.quiz ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <AnimatePresence>
          {expandedSections.quiz && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={listItemVariants}
              transition={{ duration: 0.3 }}
            >
              <Box className="flex flex-col sm:flex-row items-start p-4 rounded-lg transition-all duration-300 bg-white hover:bg-gray-50 shadow-sm">
                <QuizIcon className="mr-4 text-yellow-500" />
                <Box className="flex-1">
                  <Typography
                    variant="subtitle1"
                    className="font-semibold overflow-hidden whitespace-nowrap text-ellipsis"
                    title="Take the Quiz" // Show full title on hover
                  >
                    Take the Quiz
                  </Typography>
                  <Typography
                    variant="body2"
                    className="text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis"
                    title={
                      quizProgress?.locked
                        ? "Locked"
                        : quizAnswerCheck
                        ? "Finished"
                        : "In Progress"
                    } // Show full status on hover
                  >
                    Status:{" "}
                    {quizProgress?.locked
                      ? "Locked"
                      : quizAnswerCheck
                      ? "Finished"
                      : "In Progress"}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color={
                    quizProgress?.locked ? "inherit" : "secondary"
                  }
                  onClick={
                    quizProgress?.locked ? null : handleQuizClick
                  }
                  disabled={quizProgress?.locked}
                  className="transition-all duration-300 hover:scale-105 w-full sm:w-auto mt-2 sm:mt-0"
                >
                  {quizProgress?.locked
                    ? "Locked"
                    : quizAnswerCheck
                    ? "Review Quiz"
                    : "Take Quiz"}
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  </Grid>
)}


          {/* Coding Activities */}
          {activities.length > 0 && (
  <Grid item xs={12} md={6}>
    <Card className="overflow-hidden shadow-md h-full">
      <CardContent>
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h5" className="font-semibold text-gray-700">
            Coding Activities
          </Typography>
          <IconButton onClick={() => toggleSection("activities")} size="small">
            {expandedSections.activities ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <AnimatePresence>
          {expandedSections.activities && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              {activities.map((activity) => {
                const activityProgress =
                  lessonProgress.activitiesProgress.find(
                    (ap) => ap.activityId.toString() === activity._id.toString()
                  );
                return (
                  <motion.div
                    key={activity._id}
                    variants={listItemVariants}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      className={`flex flex-col sm:flex-row items-start p-4 rounded-lg mb-4 transition-all duration-300 ${
                        activityProgress?.locked
                          ? "bg-gray-200"
                          : "bg-white hover:bg-gray-50"
                      } shadow-sm`}
                    >
                      <Code className="mr-4 text-green-500" />
                      <Box className="flex-1">
                        <Typography
                          variant="subtitle1"
                          className="font-semibold overflow-hidden whitespace-nowrap text-ellipsis"
                          title={activity.title} // Show full title on hover
                        >
                          {activity.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          className="flex items-center text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis"
                          title={
                            activityProgress?.locked
                              ? "Locked"
                              : activityProgress?.dateFinished !== null
                              ? "Completed"
                              : "In Progress"
                          } // Show full status on hover
                        >
                          {activityProgress?.locked ? (
                            <>
                              <Lock className="w-4 h-4 mr-1" /> Locked
                            </>
                          ) : activityProgress?.dateFinished ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />{" "}
                              Completed
                            </>
                          ) : (
                            <>
                              <AccessTime className="w-4 h-4 mr-1 text-yellow-500" />{" "}
                              In Progress
                            </>
                          )}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color={
                          activityProgress?.locked ? "inherit" : "secondary"
                        }
                        onClick={
                          activityProgress?.locked
                            ? null
                            : () => handleActivityClick(activity._id)
                        }
                        disabled={activityProgress?.locked}
                        className="transition-all duration-300 hover:scale-105 w-full sm:w-auto mt-2 sm:mt-0"
                      >
                        {activityProgress?.locked
                          ? "Locked"
                          : activityProgress?.dateFinished !== null
                          ? "Open Activity"
                          : "Start Activity"}
                      </Button>
                    </Box>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  </Grid>
)}

        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default LessonContent;
