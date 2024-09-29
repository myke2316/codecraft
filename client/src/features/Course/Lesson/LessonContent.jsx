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
      console.log(lessonProgress)
  const completedDocuments = lessonProgress.documentsProgress.filter(
    (dp) => !dp.locked
  ).length;
  const completedQuiz = lessonProgress.quizzesProgress.filter(
    (dp) => dp.dateFinished !== null
  ).length;

  const completedActivities = lessonProgress.activitiesProgress.filter(
    (dp) => dp.dateFinished !== null
  ).length;

  const totalDocuments = lesson.documents.length
  const totalQuizzes = 1
  const totalActivities = lesson.activities.length
  const totalItems = totalDocuments + totalQuizzes + totalActivities;
  const completedItems = completedDocuments + completedQuiz + completedActivities;
  const progressPercentage = (completedItems / totalItems) * 100;
  const quizProgress = lessonProgress.quizzesProgress[0];
  const quizScore = quizProgress?.locked
    ? "Locked"
    : `${quizProgress?.pointsEarned} Points Earned`;
  
  const handleClick = (id) => navigate(`document/${id}`);
  const handleQuizClick = () => navigate(`quiz/${quiz._id}`);
  const handleActivityClick = () => navigate(`activity/${activities[0]._id}`);

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
            <CardContent>
              <Typography variant="h4" className="mb-4 font-bold text-gray-800">
                {lesson.title}
              </Typography>
              <Typography variant="subtitle1" className="mb-2 font-semibold">
                Overall Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                className="h-2 rounded-full"
                color="secondary"
              />
              <Typography
                variant="body2"
                className="mt-1 text-right text-gray-600"
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
                                className={`flex items-center p-4 rounded-lg mb-4 transition-all duration-300 ${
                                  docProgress?.locked
                                    ? "bg-gray-200"
                                    : "bg-white hover:bg-gray-50"
                                } shadow-sm`}
                              >
                                <Description className="mr-4 text-blue-500" />
                                <Box className="flex-1">
                                  <Typography
                                    variant="subtitle1"
                                    className="font-semibold"
                                  >
                                    {document.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    className="flex items-center text-gray-600"
                                  >
                                    {docProgress?.locked ? (
                                      <>
                                        <Lock className="w-4 h-4 mr-1" /> Locked
                                      </>
                                    ) : docProgress?.dateFinished ? (
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
                                    docProgress?.locked ? "inherit" : "primary"
                                  }
                                  onClick={
                                    docProgress?.locked
                                      ? null
                                      : () => handleClick(document._id)
                                  }
                                  disabled={docProgress?.locked}
                                  className="transition-all duration-300 hover:scale-105"
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
                    <Typography
                      variant="h5"
                      className="font-semibold text-gray-700"
                    >
                      Quiz
                    </Typography>
                    <IconButton
                      onClick={() => toggleSection("quiz")}
                      size="small"
                    >
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
                        <Box className="flex items-center p-4 rounded-lg transition-all duration-300 bg-white hover:bg-gray-50 shadow-sm">
                          <QuizIcon className="mr-4 text-yellow-500" />
                          <Box className="flex-1">
                            <Typography
                              variant="subtitle1"
                              className="font-semibold"
                            >
                              Take the Quiz
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-gray-600"
                            >
                              Status: {quizScore}
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
                            className="transition-all duration-300 hover:scale-105"
                          >
                            {quizProgress?.locked ? "Locked" : quizProgress?.dateFinished !== null ? "Review Quiz" : "Take Quiz"}
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
                    <Typography
                      variant="h5"
                      className="font-semibold text-gray-700"
                    >
                      Coding Activities
                    </Typography>
                    <IconButton
                      onClick={() => toggleSection("activities")}
                      size="small"
                    >
                      {expandedSections.activities ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
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
                              (ap) =>
                                ap.activityId.toString() ===
                                activity._id.toString()
                            );
                          return (
                            <motion.div
                              key={activity._id}
                              variants={listItemVariants}
                              transition={{ duration: 0.3 }}
                            >
                              <Box
                                className={`flex items-center p-4 rounded-lg mb-4 transition-all duration-300 ${
                                  activityProgress?.locked
                                    ? "bg-gray-200"
                                    : "bg-white hover:bg-gray-50"
                                } shadow-sm`}
                              >
                                <Code className="mr-4 text-green-500" />
                                <Box className="flex-1">
                                  <Typography
                                    variant="subtitle1"
                                    className="font-semibold"
                                  >
                                    {activity.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    className="flex items-center text-gray-600"
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
                                    activityProgress?.locked
                                      ? "inherit"
                                      : "secondary"
                                  }
                                  onClick={
                                    activityProgress?.locked
                                      ? null
                                      : handleActivityClick
                                  }
                                  disabled={activityProgress?.locked}
                                  className="transition-all duration-300 hover:scale-105"
                                >
                                  {activityProgress?.locked
                                    ? "Locked" : activityProgress?.dateFinished !== null 
                                    ?"Open Activity" :"Start Activity"}
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
