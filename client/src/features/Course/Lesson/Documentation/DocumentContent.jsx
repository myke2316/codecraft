import React, { useEffect, useState } from "react";
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
function DocumentContent() {
  const { courseId, lessonId, documentId, quizId } = useParams();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);
  const user = useSelector((state) => state.user.userDetails);
  const userId = user._id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedContent, setDisplayedContent] = useState([]);
  const [documentContent, setDocumentContent] = useState(null);
  const [iframeContents, setIframeContents] = useState({});
  const [showCompletion, setShowCompletion] = useState(false);

  const userAnalytics = useSelector(
    (state) => state.userAnalytics.userAnalytics
  );

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
                .find((courseAnalytics) => {
                  const courseIdValue =
                    typeof courseAnalytics.courseId === "object" &&
                    courseAnalytics.courseId._id
                      ? courseAnalytics.courseId._id
                      : courseAnalytics.courseId;
                  return courseIdValue === courseId;
                })
                ?.lessonsAnalytics.find((lessonAnalytics) => {
                  const lessonIdValue =
                    typeof lessonAnalytics.lessonId === "object" &&
                    lessonAnalytics.lessonId._id
                      ? lessonAnalytics.lessonId._id
                      : lessonAnalytics.lessonId;
                  return lessonIdValue === lessonId;
                })
                ?.documentsAnalytics.find((docAnalytics) => {
                  const documentIdValue =
                    typeof docAnalytics.documentId === "object" &&
                    docAnalytics.documentId._id
                      ? docAnalytics.documentId._id
                      : docAnalytics.documentId;
                  return documentIdValue === documentId;
                });

              if (existingAnalytics && existingAnalytics.timeSpent > 0) {
                // Skip timer and prevent further updates
                setStartTime(null);
                setTimer(existingAnalytics.timeSpent);
                setShowCompletion(true);
              } else {
                setStartTime(new Date().getTime()); // Set start time when document is loaded
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

  // TIMER
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const formattedTime = formatTime(timer);

  useEffect(() => {
    if (startTime) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [startTime]);

  if (!courses) return <div>Loading...</div>;

  const course = courses.find((course) => course._id === courseId);
  if (!course) return <div>Course not found</div>;

  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
  if (!lesson) return <div>Lesson not found</div>;

  const document = lesson.documents.find((doc) => doc._id === documentId);
  const quiz = lesson.quiz;

  const dispatch = useDispatch();

  const [updateUserProgress, { isLoading: isLoadingUpdateUserProgress }] =
    useUpdateUserProgressMutation();

  const [
    updateUserAnalyticsMutation,
    { isLoading: isLoadingUpdateUserAnalytics },
  ] = useUpdateUserAnalyticsMutation();
  const [isProcessing, setIsProcessing] = useState(false);

  // async function handleNext() {
  //   if (isProcessing) return; // Prevent multiple clicks

  //   setIsProcessing(true); // Disable the button
  //   setTimeout(() => {
  //     setIsProcessing(false); // Re-enable the button after 1.5 seconds
  //   }, 0);//set here for TIMER NEXT
  //   if (documentContent && currentIndex < documentContent.length - 1) {
  //     const newIndex = currentIndex + 1;
  //     setCurrentIndex(newIndex);
  //     setDisplayedContent((prevContent) => [
  //       ...prevContent,
  //       documentContent[newIndex],
  //     ]);
  //     setIframeContents("");
  //   } else {
  //     const nextDocumentIndex = lesson.documents.indexOf(document) + 1;
  //     const nextQuizIndex = lesson.quiz.indexOf(quiz) + 1;

  //     const courseAnalytics = userAnalytics.coursesAnalytics.find(
  //       (course) => course.courseId === courseId
  //     );
  //     const lessonAnalytics = courseAnalytics
  //       ? courseAnalytics.lessonsAnalytics.find(
  //           (lesson) => lesson.lessonId === lessonId
  //         )
  //       : null;
  //     const documentAnalytics = lessonAnalytics
  //       ? lessonAnalytics.documentsAnalytics.find(
  //           (doc) => doc.documentId === documentId
  //         )
  //       : null;

  //     const courseBadge = courseAnalytics?.badges || null;
  //     const lessonBadge = lessonAnalytics?.badges || null;
  //     const documentBadge = documentAnalytics?.badges || null;

  //     if (nextDocumentIndex < lesson.documents.length) {
  //       const nextDocument = lesson.documents[nextDocumentIndex];

  //       if (!showCompletion) {
  //         try {
  //           // FOR UPDATING USER PROGRESS
  //           const updateProgressData = await updateUserProgress({
  //             userId,
  //             courseId,
  //             lessonId,
  //             documentId,
  //           }).unwrap();
  //           dispatch(updateCourseProgress(updateProgressData));

  //           // FOR SETTING timer, X points for each document
  //           const updateAnalyticsData = await updateUserAnalyticsMutation({
  //             userId,
  //             analyticsData: {
  //               coursesAnalytics: [
  //                 {
  //                   courseId,
  //                   badges: courseBadge,
  //                   lessonsAnalytics: [
  //                     {
  //                       lessonId,
  //                       badges: lessonBadge,
  //                       documentsAnalytics: [
  //                         {
  //                           documentId,
  //                           timeSpent: timer,
  //                           pointsEarned: 15,
  //                           badges: documentBadge,
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           }).unwrap();
  //           console.log(updateAnalyticsData);
  //           dispatch(updateUserAnalytics(updateAnalyticsData));

  //           navigate(
  //             `/course/${courseId}/lesson/${lessonId}/document/${documentId}/complete`,
  //             { state: { formattedTime } }
  //           );
  //           setIframeContents("");
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       } else {
  //         navigate(
  //           `/course/${courseId}/lesson/${lessonId}/document/${nextDocument._id}`
  //         );
  //       }
  //     } else if (nextQuizIndex < lesson.quiz.length) {
  //       const nextQuiz = lesson.quiz[nextQuizIndex];

  //       if (!showCompletion) {
  //         try {
  //           const updateProgressData = await updateUserProgress({
  //             userId,
  //             courseId,
  //             lessonId,
  //             documentId,
  //           }).unwrap();
  //           dispatch(updateCourseProgress(updateProgressData));

  //           const updateAnalyticsData = await updateUserAnalyticsMutation({
  //             userId,
  //             analyticsData: {
  //               coursesAnalytics: [
  //                 {
  //                   courseId,
  //                   badges: courseBadge,
  //                   lessonsAnalytics: [
  //                     {
  //                       lessonId,
  //                       badges: lessonBadge,
  //                       documentsAnalytics: [
  //                         {
  //                           documentId,
  //                           timeSpent: timer,
  //                           pointsEarned: 15,
  //                           badges: documentBadge,
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           }).unwrap();
  //           console.log(updateAnalyticsData);
  //           dispatch(updateUserAnalytics(updateAnalyticsData));

  //           setIframeContents("");
  //           navigate(
  //             `/course/${courseId}/lesson/${lessonId}/document/${documentId}/complete`,
  //             { state: { formattedTime } }
  //           );
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       } else {
  //         navigate(
  //           `/course/${courseId}/lesson/${lessonId}/quiz/${nextQuiz._id}`
  //         );
  //       }
  //     }
  //   }
  //      // Re-enable the button after processing

  // }

  async function handleNext() {
    if (isProcessing) return; // Prevent multiple clicks

    setIsProcessing(true); // Disable the button
    setTimeout(() => {
      setIsProcessing(false); // Re-enable the button after processing
    }, 0);

    if (documentContent && currentIndex < documentContent.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setDisplayedContent((prevContent) => [
        ...prevContent,
        documentContent[newIndex],
      ]);
      setIframeContents("");
    } else {
      const nextDocumentIndex = lesson.documents.indexOf(document) + 1;
      const nextQuizIndex = lesson.quiz.indexOf(quiz) + 1;

      const courseAnalytics = userAnalytics.coursesAnalytics.find(
        (course) => course.courseId === courseId
      );
      const lessonAnalytics = courseAnalytics
        ? courseAnalytics.lessonsAnalytics.find(
            (lesson) => lesson.lessonId === lessonId
          )
        : null;
      const documentAnalytics = lessonAnalytics
        ? lessonAnalytics.documentsAnalytics.find(
            (doc) => doc.documentId === documentId
          )
        : null;

      const courseBadge = courseAnalytics?.badges || null;
      const lessonBadge = lessonAnalytics?.badges || null;
      const documentBadge = documentAnalytics?.badges || null;

      if (nextDocumentIndex < lesson.documents.length) {
        const nextDocument = lesson.documents[nextDocumentIndex];

        if (!showCompletion) {
          try {
            // FOR UPDATING USER PROGRESS
            const updateProgressData = await updateUserProgress({
              userId,
              courseId,
              lessonId,
              documentId,
            }).unwrap();
            dispatch(updateCourseProgress(updateProgressData));

            // FOR SETTING timer, X points for each document
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
            console.log(updateAnalyticsData);
            dispatch(updateUserAnalytics(updateAnalyticsData));

            navigate(
              `/course/${courseId}/lesson/${lessonId}/document/${documentId}/complete`,
              { state: { formattedTime } }
            );
            setIframeContents("");
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
            console.log(updateAnalyticsData);
            dispatch(updateUserAnalytics(updateAnalyticsData));

            setIframeContents("");
            navigate(
              `/course/${courseId}/lesson/${lessonId}/document/${documentId}/complete`,
              { state: { formattedTime } }
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
            // Update the user progress and analytics for the last document
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
            console.log(updateAnalyticsData);
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
    if (isProcessing) return; // Prevent multiple clicks

    setIsProcessing(true); // Disable the button
    setTimeout(() => {
      setIsProcessing(false); // Re-enable the button after 1.5 seconds
    }, 500);
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setDisplayedContent((prevContent) =>
        prevContent.slice(0, prevContent.length - 1)
      );
    }
    // Re-enable the button after processing
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
    console.log(code);
    console.log(supportingCode);
    console.log(language);
    const iframeContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Output</title>
        ${language === "css" ? `<style>${code}</style>` : ""}
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
    <Box
      sx={{
        p: 4,
        flex: 1,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={2}>
        {lesson.title}
      </Typography>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        {document ? document.title : "Quiz"}
      </Typography>
      <hr />

      <Box sx={{ flex: 1, overflowY: "auto", mb: "100px" }}>
        {" "}
        {/* Adjusted container for scrolling */}
        {document ? (
          <>
            {displayedContent.map((content, index) => (
              <Fade in={true} timeout={300} key={index}>
                <Box my={3}>
                  {content.type === "sentence" ? (
                    <Typography
                      variant="h5"
                      component="p"
                      sx={{ fontSize: "1.25rem", mb: 2 }}
                    >
                      <ContentRenderer content={content.text} />
                    </Typography>
                  ) : content.type === "snippet" ? (
                    <Paper
                      elevation={3}
                      sx={{ my: 3, p: 3, bgcolor: "grey.500", borderRadius: 2 }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        <code>{content.code}</code>
                      </pre>
                    </Paper>
                  ) : content.type === "code" ? (
                    <Paper
                      elevation={3}
                      sx={{ my: 3, p: 3, bgcolor: "grey.100", borderRadius: 2 }}
                    >
                      {content.supportingCode && (
                        <Box
                          my={2}
                          p={2}
                          sx={{ bgcolor: "grey.200", borderRadius: 2 }}
                        >
                          <pre
                            style={{
                              margin: 0,
                              fontSize: "1rem",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            <code>{content.supportingCode}</code>
                          </pre>
                        </Box>
                      )}
                      <Editor
                        height="200px"
                        defaultLanguage={content.language}
                        defaultValue={content.code}
                        options={{ readOnly: true }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() =>
                          handleRunCode(
                            index,
                            content.code,
                            content.supportingCode,
                            content.language
                          )
                        }
                      >
                        Run
                      </Button>
                      <Box mt={2}>
                        <iframe
                          srcDoc={iframeContents[index] || ""}
                          title="Output"
                          className="w-full h-64 mt-4 border"
                          style={{
                            width: "100%",
                            height: "200px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </Box>
                    </Paper>
                  ) : content.type === "codeconsole" ? (
                    <Paper
                      elevation={3}
                      sx={{ my: 3, p: 3, bgcolor: "grey.100", borderRadius: 2 }}
                    >
                      <Editor
                        height="200px"
                        defaultLanguage="javascript"
                        defaultValue={content.code}
                        options={{ readOnly: true }}
                        onChange={(value) => {
                          handleRunJavaScriptConsole(
                            value,
                            content.supportingCode
                          );
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() =>
                          handleRunJavaScriptConsole(
                            index,
                            content.code,
                            content?.supportingCode
                          )
                        }
                      >
                        Run
                      </Button>
                      <Box mt={2}>
                        <iframe
                          srcDoc={iframeContents[index] || ""}
                          title="Output"
                          className="w-full h-64 mt-4 border"
                          style={{
                            width: "100%",
                            height: "200px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </Box>
                    </Paper>
                  ) : content.type === "javascriptweb" ? (
                    <Paper
                      elevation={3}
                      sx={{ my: 3, p: 3, bgcolor: "grey.100", borderRadius: 2 }}
                    >
                      {content.supportingCode && (
                        <Box mb={2}>
                          <Typography variant="subtitle1" gutterBottom>
                            Supporting Code:
                          </Typography>
                          <Paper
                            elevation={2}
                            sx={{ p: 2, bgcolor: "grey.200", borderRadius: 1 }}
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
                      <Typography variant="subtitle1" gutterBottom>
                        Your Code:
                      </Typography>
                      <Editor
                        height="200px"
                        defaultLanguage="javascript"
                        defaultValue={content.code}
                        options={{ readOnly: true }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() =>
                          handleRunCode(
                            index,
                            content.code,
                            content?.supportingCode,
                            content?.language
                          )
                        }
                      >
                        Run
                      </Button>
                      <Box mt={2}>
                        <iframe
                          srcDoc={iframeContents[index] || ""}
                          title="Output"
                          className="w-full h-64 mt-4 border"
                          style={{
                            width: "100%",
                            height: "200px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </Box>
                    </Paper>
                  ) : null}
                </Box>
              </Fade>
            ))}
          </>
        ) : (
          <QuizContent
            quizId={quizId}
            quiz={quiz}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
      </Box>

      {document && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            bgcolor: "background.paper",
            py: 2,
            boxShadow: 3,
            zIndex: 1000,
          }}
        >
          <Container
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleBack}
              disabled={currentIndex === 0 || isProcessing}
            >
              Back
            </Button>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{ width: "60%", height: 10, borderRadius: 5 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={isProcessing}
            >
              {documentContent && currentIndex === documentContent.length - 1
                ? "Finish"
                : "Next"}
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
}

export default DocumentContent;
