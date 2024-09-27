import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import QuizContent from "../Quiz/QuizContent";
import Editor from "@monaco-editor/react";
import { useUpdateUserProgressMutation } from "../../../Student/studentCourseProgressService";
import { updateCourseProgress } from "../../../Student/studentCourseProgressSlice";
import DocumentComplete from "./DocumentComplete";
import { formatTime } from "../../../../utils/formatTime";
import {
  useFetchUserAnalyticsMutation,
  useUpdateUserAnalyticsMutation,
} from "../../../Student/userAnalyticsService";
import { styled } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion, AnimatePresence } from "framer-motion";
import { updateUserAnalytics } from "../../../Student/userAnalyticsSlice";
import ContentRenderer from "../../../../utils/ContentRenderer";
import {
  Fade,
  Button,
  Box,
  Typography,
  LinearProgress,
  Container,
  Paper,
} from "@mui/material";

const theme = {
  primary: "#FFD700", // Yellow
  secondary: "#000000", // Black
  background: "#FFFFFF", // White
};

const StyledBox = styled(Box)({
  backgroundColor: theme.background,
  color: theme.secondary,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
});

const StyledButton = styled(Button)({
  backgroundColor: theme.primary,
  color: theme.secondary,
  "&:hover": {
    backgroundColor: theme.secondary,
    color: theme.primary,
  },
  "&:disabled": {
    backgroundColor: "#ccc",
    color: "#666",
  },
});

const StyledPaper = styled(Paper)({
  backgroundColor: theme.background,
  color: theme.secondary,
  border: `2px solid ${theme.primary}`,
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "16px",
});

const StyledLinearProgress = styled(LinearProgress)({
  backgroundColor: theme.background,
  "& .MuiLinearProgress-bar": {
    backgroundColor: theme.primary,
  },
});

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function DocumentContent() {
  const { courseId, lessonId, documentId, quizId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.course.courseData);
  const user = useSelector((state) => state.user.userDetails);
  const userId = user._id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedContent, setDisplayedContent] = useState([]);
  const [documentContent, setDocumentContent] = useState(null);
  const [iframeContents, setIframeContents] = useState({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const contentRef = useRef(null);

  const userAnalytics = useSelector((state) => state.userAnalytics.userAnalytics);

  const [updateUserProgress] = useUpdateUserProgressMutation();
  const [updateUserAnalyticsMutation] = useUpdateUserAnalyticsMutation();

  useEffect(() => {
    if (courses) {
      const course = courses.find((course) => course._id === courseId);
      if (course) {
        const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
        if (lesson) {
          if (documentId) {
            const document = lesson.documents.find((doc) => doc._id === documentId);
            if (document) {
              setDocumentContent(document.content);
              setCurrentIndex(0);
              setDisplayedContent([document.content[0]]);
              setShowCompletion(false);

              const existingAnalytics = userAnalytics.coursesAnalytics
                .find((courseAnalytics) => courseAnalytics.courseId === courseId)
                ?.lessonsAnalytics.find((lessonAnalytics) => lessonAnalytics.lessonId === lessonId)
                ?.documentsAnalytics.find((docAnalytics) => docAnalytics.documentId === documentId);

              if (existingAnalytics && existingAnalytics.timeSpent > 0) {
                setStartTime(null);
                setTimer(existingAnalytics.timeSpent);
                setShowCompletion(true);
              } else {
                setStartTime(new Date().getTime());
              }
            }
          } else if (lesson.quiz && lesson.quiz.length > 0) {
            setDocumentContent(lesson.quiz);
            setCurrentIndex(0);
            setShowCompletion(false);
          }
        }
      }
    }
  }, [courses, courseId, lessonId, documentId, quizId, userAnalytics]);

  useEffect(() => {
    if (startTime) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [startTime]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [displayedContent]);

  if (!courses) return <div>Loading...</div>;

  const course = courses.find((course) => course._id === courseId);
  if (!course) return <div>Course not found</div>;

  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
  if (!lesson) return <div>Lesson not found</div>;

  const document = lesson.documents.find((doc) => doc._id === documentId);
  const quiz = lesson.quiz;

  async function handleNext() {
    if (isProcessing) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 0);

    if (documentContent && currentIndex < documentContent.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setDisplayedContent((prevContent) => [...prevContent, documentContent[newIndex]]);
    } else {
      const nextDocumentIndex = lesson.documents.indexOf(document) + 1;
      const nextQuizIndex = lesson.quiz.indexOf(quiz) + 1;

      const courseAnalytics = userAnalytics.coursesAnalytics.find(
        (course) => course.courseId === courseId
      );
      const lessonAnalytics = courseAnalytics?.lessonsAnalytics.find(
        (lesson) => lesson.lessonId === lessonId
      );
      const documentAnalytics = lessonAnalytics?.documentsAnalytics.find(
        (doc) => doc.documentId === documentId
      );

      const courseBadge = courseAnalytics?.badges || null;
      const lessonBadge = lessonAnalytics?.badges || null;
      const documentBadge = documentAnalytics?.badges || null;

      if (nextDocumentIndex < lesson.documents.length) {
        const nextDocument = lesson.documents[nextDocumentIndex];

        if (!showCompletion) {
          try {
            const updateProgressData = await updateUserProgress({
              userId,
              courseId,
              lessonId,
              documentId,
            }).unwrap();
            dispatch(updateCourseProgress(updateProgressData));

            const updateAnalyticsData = await updateUserAnalyticsMutation({
              userId,
              analyticsData: {
                coursesAnalytics: [
                  {
                    courseId,
                    badges: courseBadge,
                    lessonsAnalytics: [
                      {
                        lessonId,
                        badges: lessonBadge,
                        documentsAnalytics: [
                          {
                            documentId,
                            timeSpent: timer,
                            pointsEarned: 15,
                            badges: documentBadge,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            }).unwrap();
            dispatch(updateUserAnalytics(updateAnalyticsData));

            navigate(
              `/course/${courseId}/lesson/${lessonId}/document/${documentId}/complete`,
              { state: { formattedTime: formatTime(timer) } }
            );
          } catch (error) {
            console.log(error);
          }
        } else {
          navigate(
            `/course/${courseId}/lesson/${lessonId}/document/${nextDocument._id}`
          );
        }
      } else if (nextQuizIndex < lesson.quiz.length) {
        const nextQuiz = lesson.quiz[nextQuizIndex];

        if (!showCompletion) {
          try {
            const updateProgressData = await updateUserProgress({
              userId,
              courseId,
              lessonId,
              documentId,
            }).unwrap();
            dispatch(updateCourseProgress(updateProgressData));

            const updateAnalyticsData = await updateUserAnalyticsMutation({
              userId,
              analyticsData: {
                coursesAnalytics: [
                  {
                    courseId,
                    badges: courseBadge,
                    lessonsAnalytics: [
                      {
                        lessonId,
                        badges: lessonBadge,
                        documentsAnalytics: [
                          {
                            documentId,
                            timeSpent: timer,
                            pointsEarned: 15,
                            badges: documentBadge,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            }).unwrap();
            dispatch(updateUserAnalytics(updateAnalyticsData));

            navigate(
              `/course/${courseId}/lesson/${lessonId}/document/${documentId}/complete`,
              { state: { formattedTime: formatTime(timer) } }
            );
          } catch (error) {
            console.log(error);
          }
        } else {
          navigate(
            `/course/${courseId}/lesson/${lessonId}/quiz/${nextQuiz._id}`
          );
        }
      } else {
        // All lessons and quizzes are done
        const nextCourseIndex = courses.indexOf(course) + 1;
        if (nextCourseIndex < courses.length) {
          const nextCourse = courses[nextCourseIndex];
          navigate(
            `/course/${nextCourse._id}/lesson/${nextCourse.lessons[0]._id}`
          );
        } else {
          // Update progress and analytics for the last document before redirecting to certification
          try {
            const updateProgressData = await updateUserProgress({
              userId,
              courseId,
              lessonId,
              documentId,
            }).unwrap();
            dispatch(updateCourseProgress(updateProgressData));

            const updateAnalyticsData = await updateUserAnalyticsMutation({
              userId,
              analyticsData: {
                coursesAnalytics: [
                  {
                    courseId,
                    badges: courseBadge,
                    lessonsAnalytics: [
                      {
                        lessonId,
                        badges: lessonBadge,
                        documentsAnalytics: [
                          {
                            documentId,
                            timeSpent: timer,
                            pointsEarned: 15,
                            badges: documentBadge,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            }).unwrap();
            dispatch(updateUserAnalytics(updateAnalyticsData));

            navigate(`/course/${userId}/certification`);
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }

  const handleBack = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setDisplayedContent((prevContent) =>
        prevContent.slice(0, prevContent.length - 1)
      );
    }
  };

  const handleRunJavaScriptWeb = (index, code, supportingCode, html) => {
    const iframeContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Output</title>
      </head>
      <body>
        ${html || '<div id="app"></div>'}
        <script>
          ${supportingCode ? supportingCode : ""}
          ${code}
        </script>
      </body>
      </html>
    `;
    setIframeContents((prevContents) => ({
      ...prevContents,
      [index]: iframeContent,
    }));
  };

  const handleRunJavaScriptConsole = (index, code, supportingCode) => {
    const iframeContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Output</title>
      </head>
      <body>
        <script>
          (function() {
            const originalConsoleLog = console.log;
            let consoleOutput = "";
            
            console.log = function(...args) {
              const formattedArgs = args.map(arg => {
                if (typeof arg === 'object') {
                  try {
                    return JSON.stringify(arg, null, 2);
                  } catch (e) {
                    return String(arg);
                  }
                }
                return String(arg);
              });
              consoleOutput += formattedArgs.join(' ') + '\\n';
              originalConsoleLog.apply(console, arguments);
              document.body.innerHTML = "<pre>" + consoleOutput + "</pre>";
            };
  
            ${supportingCode ? supportingCode : ""}
            ${code}
          })();
        </script>
      </body>
      </html>
    `;
    setIframeContents((prevContents) => ({
      ...prevContents,
      [index]: iframeContent,
    }));
  };

  const handleRunCode = (index, code, supportingCode, language) => {
    const iframeContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Output</title>
        ${language === "CSS" ? `<style>${code}</style>` : ""}
      </head>
      <body>
        ${language === "html" ? code : ""}
        ${supportingCode ? supportingCode : ""}
        ${language === "javascript" ? `<script>${code}</script>` : ""}
      </body>
      </html>
    `;
    setIframeContents((prevContents) => ({
      ...prevContents,
      [index]: iframeContent,
    }));
  };

  const progressPercentage = documentContent
    ? ((currentIndex + 1) / documentContent.length) * 100
    : 0;

    return (
      <StyledBox>
        <Box ref={contentRef} sx={{ flexGrow: 1, overflowY: 'auto', height: 'calc(100% - 64px)' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" mb={2} color={theme.secondary}>
              {lesson.title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" mb={2} color={theme.secondary}>
              {document ? document.title : "Quiz"}
            </Typography>
            <Box sx={{ borderBottom: `2px solid ${theme.primary}`, mb: 4 }} />
  
            <Box>
              {document ? (
                <AnimatePresence initial={false}>
                  {displayedContent.map((content, index) => (
                    <motion.div
                      key={index}
                      variants={contentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      <Box my={3}>
                        {content.type === "sentence" && (
                          <Typography variant="body1" sx={{ fontSize: "1.1rem", mb: 2 }}>
                            <ContentRenderer content={content.text} />
                          </Typography>
                        )}
                        {content.type === "snippet" && (
                          <StyledPaper elevation={3}>
                            <pre
                              style={{
                                margin: 0,
                                padding: 0,
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                                fontSize: "0.9rem",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "4px",
                                padding: "16px",
                              }}
                            >
                              <code>{content.code}</code>
                            </pre>
                          </StyledPaper>
                        )}
                        {(content.type === "code" || content.type === "codeconsole" || content.type === "javascriptweb") && (
                          <StyledPaper elevation={3}>
                            {content.supportingCode && (
                              <Box mb={2}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Supporting Code:
                                </Typography>
                                <Paper
                                  elevation={2}
                                  sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}
                                >
                                  <pre
                                    style={{
                                      margin: 0,
                                      padding: 0,
                                      whiteSpace: "pre-wrap",
                                      wordWrap: "break-word",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    <code>{content.supportingCode}</code>
                                  </pre>
                                </Paper>
                              </Box>
                            )}
                            <Editor
                              height="200px"
                              defaultLanguage={content.language || "javascript"}
                              defaultValue={content.code}
                              theme="vs-dark"
                              options={{ readOnly: true, minimap: { enabled: false } }}
                            />
                            <StyledButton
                              onClick={() => handleRunCode(index, content.code, content.supportingCode, content.language)}
                              sx={{ mt: 2 }}
                            >
                              Run Code
                            </StyledButton>
                            {iframeContents[index] && (
                              <Box mt={2}>
                                <iframe
                                  srcDoc={iframeContents[index]}
                                  style={{ width: "100%", height: "200px", border: "none" }}
                                  title="Code Output"
                                />
                              </Box>
                            )}
                          </StyledPaper>
                        )}
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <QuizContent
                  quizId={quizId}
                  quiz={quiz}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
            </Box>
          </Container>
        </Box>
  
        <Box
          sx={{
            borderTop: `2px solid ${theme.primary}`,
            py: 2,
            backgroundColor: theme.background,
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <StyledButton
              variant="contained"
              onClick={handleBack}
              disabled={currentIndex === 0 || isProcessing}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </StyledButton>
            <StyledLinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{ width: "60%", height: 8, borderRadius: 4 }}
            />
            <StyledButton
              variant="contained"
              onClick={handleNext}
              disabled={isProcessing}
              endIcon={<ArrowForwardIcon />}
            >
              {documentContent && currentIndex === documentContent.length - 1
                ? "Finish"
                : "Next"}
            </StyledButton>
          </Container>
        </Box>
      </StyledBox>
    );
}

export default DocumentContent;



