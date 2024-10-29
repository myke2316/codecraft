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
  Card,
  CardContent,
} from "@mui/material";
import { useCompleteCourseMutation } from "../../../LoginRegister/userService";

const theme = {
  primary: "#9683ec", // Yellow
  secondary: "	#21004b", // Black
  background: "#FFFFFF", // White
};

const StyledBox = styled(Box)({
  backgroundColor: theme.background,
  color: theme.secondary,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  p: 0,
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.background,
  color: theme.secondary,
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "16px",
  position: "relative",
  overflow: "hidden",

  // Add a box-shadow for the glowing effect
  boxShadow: "0 0 15px rgba(63, 81, 181, 0.6)", // Blue glow
  "&::before": {
    content: '""',
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #3f51b5, #1e88e5)", // Gradient from Indigo to Blue
    opacity: 0.3, // Slightly transparent for a glowing effect
    zIndex: -1, // Place it behind the content
  },
}));

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
const ScrollableBox = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: "auto",
  height: "calc(100% - 180px)",

  // Add padding to create space for the floating effect
  paddingTop: "10px",
  paddingBottom: "10px",

  // Scrollbar styling
  "&::-webkit-scrollbar": {
    width: "12px", // Slightly wider for a more modern look
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent", // Transparent to create the floating effect
    borderRadius: "10px",
    marginTop: "10px", // Adds space at the top
    marginBottom: "10px", // Adds space at the bottom
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(126, 33, 212, 0.8)", // A semi-transparent color for a softer effect
    borderRadius: "10px",
    border: "3px solid rgba(0, 0, 0, 0.1)", // Adds a border to make the thumb look like it's floating
    "&:hover": {
      background: "rgba(118, 48, 255, 1)", // Changes color on hover for interaction feedback
    },
  },
}));

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
  const userProgress = useSelector(
    (state) => state.studentProgress.userProgress
  );
  const userAnalytics = useSelector(
    (state) => state.userAnalytics.userAnalytics
  );

  const [updateUserProgress] = useUpdateUserProgressMutation();
  const [updateUserAnalyticsMutation] = useUpdateUserAnalyticsMutation();

  useEffect(() => {
    if (courses) {
      const course = courses.find((course) => course._id === courseId);
      if (course) {
        const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
        if (lesson) {
          if (documentId) {
            const document = lesson.documents.find(
              (doc) => doc._id === documentId
            );
            if (document) {
              setDocumentContent(document.content);
              setCurrentIndex(0);
              setDisplayedContent([document.content[0]]);
              setShowCompletion(false);

              const existingAnalytics = userAnalytics.coursesAnalytics
                .find(
                  (courseAnalytics) => courseAnalytics.courseId === courseId
                )
                ?.lessonsAnalytics.find(
                  (lessonAnalytics) => lessonAnalytics.lessonId === lessonId
                )
                ?.documentsAnalytics.find(
                  (docAnalytics) => docAnalytics.documentId === documentId
                );

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
 
  const [completeCourse, { isLoading: isLoadingCompleteCourse }] =
    useCompleteCourseMutation();

  async function handleNext() {
    if (isProcessing) return;

    setIsProcessing(true);

    if (documentContent && currentIndex < documentContent.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setDisplayedContent((prevContent) => [
        ...prevContent,
        documentContent[newIndex],
      ]);
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

              navigate(`/course/${userId}/certification`);
            } catch (error) {
              console.log(error);
            }
          } else {
            navigate(`/course/${userId}/certification`);
          }
        }
      }
    }
    setIsProcessing(false);
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

  //before nung hindi pa nagana ang mga .map sa JS ES6, 10/21/24
  // const handleRunJavaScriptConsole = (index, code, supportingCode) => {
  //   const iframeContent = `
  //     <!DOCTYPE html>
  //     <html lang="en">
  //     <head>
  //       <meta charset="UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <title>Output</title>
  //     </head>
  //     <body>
  //       <script>
  //         (function() {
  //           const originalConsoleLog = console.log;
  //           let consoleOutput = "";

  //           console.log = function(...args) {
  //             const formattedArgs = args.map(arg => {
  //               if (typeof arg === 'object') {
  //                 try {
  //                   return JSON.stringify(arg, null, 2);
  //                 } catch (e) {
  //                   return String(arg);
  //                 }
  //               }
  //               return String(arg);
  //             });
  //             consoleOutput += formattedArgs.join(' ') + '\\n';
  //             originalConsoleLog.apply(console, arguments);
  //             document.body.innerHTML = "<pre>" + consoleOutput + "</pre>";
  //           };

  //           ${supportingCode ? supportingCode : ""}
  //           ${code}
  //         })();
  //       </script>
  //     </body>
  //     </html>
  //   `;
  //   setIframeContents((prevContents) => ({
  //     ...prevContents,
  //     [index]: iframeContent,
  //   }));
  // };

  //dito gumagana na pero not sure kung gagana sa iba, 10/21/24
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
                if (arg instanceof Map) {
                  return JSON.stringify(Array.from(arg.entries()), null, 2); // Convert Map to array of entries and stringify
                } else if (typeof arg === 'object') {
                  try {
                    return JSON.stringify(arg, null, 2);
                  } catch (e) {
                    return String(arg);
                  }
                }
                return String(arg);
              });
              consoleOutput += formattedArgs.join(' ') + '\\n';
              originalConsoleLog.apply(console, args);
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

  const handleRunCode = (index, code, supportingCode, language, type) => {
    if (type === "codeconsole") {
      handleRunJavaScriptConsole(index, code, supportingCode);
    } else {
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
    }
  };

  const progressPercentage = documentContent
    ? ((currentIndex + 1) / documentContent.length) * 100
    : 0;
  const contentRefs = useRef([]);
  useEffect(() => {
    if (contentRefs.current[currentIndex]) {
      contentRefs.current[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentIndex]);
  return (
    <StyledBox>
      {/* Title Section */}
      <div className="bg-gradient-to-r from-indigo-400 to-purple-600 shadow-2xl rounded-lg p-6 mb-4 text-center m-4">
  <div className="max-w-3xl mx-auto">
    <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 tracking-wide">
      {lesson.title}
    </h1>
    <h2 className="text-.5xl md:text-2xl font-medium text-gray-200">
      {document ? document.title : "Quiz"}
    </h2>
  </div>
</div>


      {/* Main Content Section */}
      <ScrollableBox>
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
                    ref={(el) => (contentRefs.current[index] = el)}
                  >
                    <Box my={3}>
                      {content.type === "sentence" && (
                        <Box
                          sx={{
                            padding: "16px", // Simple padding
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: { xs: "1.5rem", sm: "2rem" }, // Responsive font size
                              fontWeight: "400", // Normal weight for simplicity
                              color: "text.primary", // Use primary text color from theme
                              lineHeight: 1.5, // Comfortable line height for readability
                            }}
                          >
                            <ContentRenderer content={content.text} />
                          </Typography>
                        </Box>
                      )}
                      {content.type === "snippet" && (
                        <StyledPaper elevation={3}>
                          <pre
                            style={{
                              margin: 0,

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
                      {(content.type === "code" ||
                        content.type === "codeconsole" ||
                        content.type === "javascriptweb") && (
                        <StyledPaper elevation={3}>
                          {content.supportingCode && (
                            <Box mb={2}>
                              <Typography variant="subtitle2" gutterBottom>
                                Supporting Code:
                              </Typography>
                              <Paper
                                elevation={2}
                                sx={{
                                  p: 2,
                                  bgcolor: "grey.100",
                                  borderRadius: 1,
                                }}
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
                            defaultLanguage={
                              content.language.toLowerCase() || "javascript"
                            }
                            defaultValue={content.code}
                            theme="vs-dark"
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                            }}
                          />
                          <StyledButton
                            onClick={() =>
                              handleRunCode(
                                index,
                                content.code,
                                content.supportingCode,
                                content.language,
                                content.type
                              )
                            }
                            sx={{ mt: 2 }}
                          >
                            Run Code
                          </StyledButton>
                          {iframeContents[index] && (
                            <Box mt={2}>
                              <iframe
                                srcDoc={iframeContents[index]}
                                style={{
                                  width: "100%",
                                  height: "200px",
                                  border: "none",
                                }}
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
      </ScrollableBox>

      {/* Navigation Bar (Next and Back and Progress) */}
      {document && (
        <Box
          sx={{
            mb: 4,
            mx: 3,

            py: 3, // Increased padding for a more spacious look
            px: 2,
            backgroundColor: "#ffffff",
            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)", // Subtle shadow to lift the section
            borderRadius: "8px", // Slightly round the edges for a softer look
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2, // Add space between elements
            }}
          >
            <StyledButton
              variant="contained"
              onClick={handleBack}
              disabled={currentIndex === 0 || isProcessing}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: "50px", // Make the button more pill-shaped
                padding: "10px 24px", // Increase button padding for better clickability
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)", // Slight 3D effect
                transition: "all 0.3s ease", // Smooth hover animation
                "&:hover": {
                  boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)", // Increase shadow on hover
                  backgroundColor: theme.primaryDark, // Darken button on hover
                },
              }}
            >
              Back
            </StyledButton>

            <StyledLinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                width: "60%",
                height: 10, // Slightly taller for better visibility
                borderRadius: 5, // Rounded edges for the progress bar
                backgroundColor: theme.lightBackground, // A light background for the unfilled portion
                boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.2)", // Inner shadow to give it depth
              }}
            />

            <StyledButton
              variant="contained"
              onClick={handleNext}
              disabled={isProcessing}
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: "50px",
                padding: "10px 24px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)", // Button shadow
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)", // Shadow on hover
                  backgroundColor: theme.primaryDark, // Darken button on hover
                },
              }}
            >
              {documentContent && currentIndex === documentContent.length - 1
                ? "Finish"
                : "Next"}
            </StyledButton>
          </Container>
        </Box>
      )}
    </StyledBox>
  );
}

export default DocumentContent;
