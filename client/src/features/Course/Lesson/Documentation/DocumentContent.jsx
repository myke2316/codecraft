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

  async function handleNext() {
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
      }
    }
  }

  // async function handleNext() {
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
  //                   lessonsAnalytics: [
  //                     {
  //                       lessonId,
  //                       documentsAnalytics: [
  //                         {
  //                           documentId,
  //                           timeSpent: timer,
  //                           pointsEarned: 15,
  //                         },
  //                       ],
  //                     },
  //                   ]
  //                 },
  //               ],
  //             },
  //           }).unwrap();
  //           console.log(updateAnalyticsData)
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
  //                   lessonsAnalytics: [
  //                     {
  //                       lessonId,
  //                       documentsAnalytics: [
  //                         {
  //                           documentId,
  //                           timeSpent: timer,
  //                           pointsEarned: 15,
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
  // }

  const handleBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setDisplayedContent((prevContent) =>
        prevContent.slice(0, prevContent.length - 1)
      );
    }
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
                      sx={{ my: 3, p: 3, bgcolor: "grey.100", borderRadius: 2 }}
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
              disabled={currentIndex === 0}
            >
              Back
            </Button>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{ width: "60%", height: 10, borderRadius: 5 }}
            />
            <Button variant="contained" color="primary" onClick={handleNext}>
              {documentContent && currentIndex === documentContent.length - 1
                ? "Finish"
                : "Next"}
            </Button>
          </Container>
        </Box>
      )}
    </Box>

    //old design
    // <div className="flex-1 p-4">

    //   <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
    //   <h1 className="text-2xl font-bold mb-4">
    //     {document ? document.title : "Quiz"}

    //   </h1>
    //   <hr />
    //   {document ? (
    //     <TransitionGroup>
    //       {displayedContent.map((content, index) => (
    //         <CSSTransition
    //           key={index}
    //           classNames="fade"
    //           timeout={300}
    //           appear={true}
    //         >
    //           <div>
    //             {content.type === "sentence" ? (
    //               // <ContentRenderer><p className="my-4">{content.text}</p>
    //               <ContentRenderer content ={content.text} />
    //             ) : content.type === "snippet" ? (
    //               <div className="my-4 bg-gray-200 p-4 rounded">
    //                 <pre>
    //                   <code>{content.code}</code>
    //                 </pre>
    //               </div>
    //             ) : content.type === "code" ? (
    //               <div className="my-4 bg-gray-200 p-4 rounded">
    //                 {content.supportingCode && (
    //                   <div className="my-2 bg-gray-100 p-2 rounded">
    //                     <pre>
    //                       <code>{content.supportingCode}</code>
    //                     </pre>
    //                   </div>
    //                 )}
    //                 <Editor
    //                   height="200px"
    //                   defaultLanguage={content.language}
    //                   defaultValue={content.code}
    //                   options={{readOnly:true}}
    //                 />
    //                 <button
    //                   className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
    //                   onClick={() =>
    //                     handleRunCode(
    //                       index,
    //                       content.code,
    //                       content.supportingCode,
    //                       content.language
    //                     )
    //                   }
    //                 >
    //                   Run
    //                 </button>
    //                 <iframe
    //                    srcDoc={iframeContents[index] || ""}
    //                   title="Output"
    //                   className="w-full h-64 mt-4 border"
    //                 />
    //               </div>
    //             ) : content.type === "codeconsole" ? (
    //               <div className="my-4 bg-gray-200 p-4 rounded">
    //                 <Editor
    //                   height="200px"
    //                   defaultLanguage="javascript"
    //                   defaultValue={content.code}
    //                   options={{readOnly:true}}
    //                   onChange={(value) => {
    //                     handleRunJavaScriptConsole(value, content.supportingCode);
    //                   }}
    //                 />
    //                 <button
    //                   className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
    //                   onClick={() =>
    //                     handleRunJavaScriptConsole(
    //                       index,
    //                       content.code,
    //                       content?.supportingCode
    //                     )
    //                   }
    //                 >
    //                   Run
    //                 </button>
    //                 <iframe
    //                    srcDoc={iframeContents[index] || ""}
    //                   title="Output"
    //                   className="w-full h-64 mt-4 border"
    //                 />
    //               </div>
    //             ) : null
    //             }
    //           </div>
    //         </CSSTransition>
    //       ))}
    //     </TransitionGroup>
    //   ) : (
    //     <QuizContent
    //       quizId={quizId}
    //       quiz={quiz}
    //       onNext={handleNext}
    //       onBack={handleBack}
    //     />
    //   )}
    //   {document && (
    //     <div
    //       className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-md flex justify-between items-center"
    //       style={{ zIndex: 1000 }}
    //     >
    //       <button
    //         className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
    //         onClick={handleBack}
    //         disabled={currentIndex === 0}
    //       >
    //         Back
    //       </button>
    //       <div
    //         className="progress-bar"
    //         style={{
    //           width: `${progressPercentage}%`,
    //           backgroundColor: `rgba(0, 128, 0, ${progressPercentage / 100})`,
    //           height: 20,
    //           borderRadius: 10,
    //         }}
    //       />
    //       <button
    //         className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
    //         onClick={handleNext}
    //       >
    //         {documentContent && currentIndex === documentContent.length - 1
    //           ? "Finish"
    //           : "Next"}
    //       </button>
    //     </div>
    //   )}
    // </div>
  );
}

export default DocumentContent;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router";
// import { TransitionGroup, CSSTransition } from "react-transition-group";
// import QuizContent from "../Quiz/QuizContent";
// import Editor from "@monaco-editor/react";
// import { useUpdateUserProgressMutation } from "../../../Student/studentCourseProgressService";
// import { updateCourseProgress } from "../../../Student/studentCourseProgressSlice";
// import DocumentComplete from "./DocumentComplete";
// import { formatTime } from "../../../../utils/formatTime";
// import {
//   useFetchUserAnalyticsMutation,
//   useUpdateUserAnalyticsMutation,
// } from "../../../Student/userAnalyticsService";
// import { updateUserAnalytics } from "../../../Student/userAnalyticsSlice";
// import ContentRenderer from "../../../../utils/ContentRenderer";

// function DocumentContent() {
//   const { courseId, lessonId, documentId, quizId } = useParams();
//   const navigate = useNavigate();
//   const courses = useSelector((state) => state.course.courseData);
//   const user = useSelector((state) => state.user.userDetails);
//   const userId = user._id;
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [displayedContent, setDisplayedContent] = useState([]);
//   const [documentContent, setDocumentContent] = useState(null);
//   const [iframeContent, setIframeContent] = useState("");
//   const [showCompletion, setShowCompletion] = useState(false);

//   const userAnalytics = useSelector(
//     (state) => state.userAnalytics.userAnalytics
//   );

//   useEffect(() => {
//     if (courses) {
//       const course = courses.find((course) => course._id === courseId);
//       if (course) {
//         const lesson = course.lessons.find((lesson) => lesson._id === lessonId);

//         if (lesson) {
//           if (documentId) {
//             const document = lesson.documents.find(
//               (doc) => doc._id === documentId
//             );

//             if (document) {
//               setDocumentContent(document.content);
//               setCurrentIndex(0);
//               setDisplayedContent([document.content[0]]);
//               setShowCompletion(false);

//               const existingAnalytics = userAnalytics.coursesAnalytics
//                 .find((courseAnalytics) => {
//                   const courseIdValue =
//                     typeof courseAnalytics.courseId === "object" &&
//                     courseAnalytics.courseId._id
//                       ? courseAnalytics.courseId._id
//                       : courseAnalytics.courseId;
//                   return courseIdValue === courseId;
//                 })
//                 ?.lessonsAnalytics.find((lessonAnalytics) => {
//                   const lessonIdValue =
//                     typeof lessonAnalytics.lessonId === "object" &&
//                     lessonAnalytics.lessonId._id
//                       ? lessonAnalytics.lessonId._id
//                       : lessonAnalytics.lessonId;
//                   return lessonIdValue === lessonId;
//                 })
//                 ?.documentsAnalytics.find((docAnalytics) => {
//                   const documentIdValue =
//                     typeof docAnalytics.documentId === "object" &&
//                     docAnalytics.documentId._id
//                       ? docAnalytics.documentId._id
//                       : docAnalytics.documentId;
//                   return documentIdValue === documentId;
//                 });

//               if (existingAnalytics && existingAnalytics.timeSpent > 0) {
//                 // Skip timer and prevent further updates
//                 setStartTime(null);
//                 setTimer(existingAnalytics.timeSpent);
//                 setShowCompletion(true);
//               } else {
//                 setStartTime(new Date().getTime()); // Set start time when document is loaded
//               }
//             }
//           } else if (lesson.quiz && lesson.quiz.length > 0) {
//             setDocumentContent(lesson.quiz);
//             setCurrentIndex(0);
//             setShowCompletion(false);
//           }
//         }
//       }
//     }
//   }, [courses, courseId, lessonId, documentId, quizId, userAnalytics]);

//   // TIMER
//   const [timer, setTimer] = useState(0);
//   const [startTime, setStartTime] = useState(null);
//   const formattedTime = formatTime(timer);

//   useEffect(() => {
//     if (startTime) {
//       const intervalId = setInterval(() => {
//         setTimer((prevTimer) => prevTimer + 1);
//       }, 1000);
//       return () => clearInterval(intervalId);
//     }
//   }, [startTime]);

//   if (!courses) return <div>Loading...</div>;

//   const course = courses.find((course) => course._id === courseId);
//   if (!course) return <div>Course not found</div>;

//   const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
//   if (!lesson) return <div>Lesson not found</div>;

//   const document = lesson.documents.find((doc) => doc._id === documentId);
//   const quiz = lesson.quiz;

//   const dispatch = useDispatch();

//   const [updateUserProgress, { isLoading: isLoadingUpdateUserProgress }] =
//     useUpdateUserProgressMutation();

//   const [
//     updateUserAnalyticsMutation,
//     { isLoading: isLoadingUpdateUserAnalytics },
//   ] = useUpdateUserAnalyticsMutation();

//   async function handleNext() {
//     if (documentContent && currentIndex < documentContent.length - 1) {
//       const newIndex = currentIndex + 1;
//       setCurrentIndex(newIndex);
//       setDisplayedContent((prevContent) => [
//         ...prevContent,
//         documentContent[newIndex],
//       ]);
//       setIframeContent("");
//     } else {
//       const nextDocumentIndex = lesson.documents.indexOf(document) + 1;
//       const nextQuizIndex = lesson.quiz.indexOf(quiz) + 1;

//       if (nextDocumentIndex < lesson.documents.length) {
//         const nextDocument = lesson.documents[nextDocumentIndex];

//         if (!showCompletion) {
//           try {
//             // FOR UPDATING USER PROGRESS
//             const updateProgressData = await updateUserProgress({
//               userId,
//               courseId,
//               lessonId,
//               documentId,
//             }).unwrap();
//             dispatch(updateCourseProgress(updateProgressData));

//             // FOR SETTING timer, X points for each document
//             const updateAnalyticsData = await updateUserAnalyticsMutation({
//               userId,
//               analyticsData: {
//                 coursesAnalytics: [
//                   {
//                     courseId,
//                     lessonsAnalytics: [
//                       {
//                         lessonId,
//                         documentsAnalytics: [
//                           {
//                             documentId,
//                             timeSpent: timer,
//                             pointsEarned: 15,
//                           },
//                         ],
//                       },
//                     ],
//                   },
//                 ],
//               },
//             }).unwrap();

//             dispatch(updateUserAnalytics(updateAnalyticsData));

//             navigate(
//               `/course/${courseId}/lesson/${lessonId}/document/${documentId}/complete`,
//               { state: { formattedTime } }
//             );
//             setIframeContent("");
//           } catch (error) {
//             console.log(error);
//           }
//         } else {
//           navigate(
//             `/course/${courseId}/lesson/${lessonId}/document/${nextDocument._id}`
//           );
//         }
//       } else if (nextQuizIndex < lesson.quiz.length) {
//         const nextQuiz = lesson.quiz[nextQuizIndex];

//         if (!showCompletion) {
//           try {
//             const updateProgressData = await updateUserProgress({
//               userId,
//               courseId,
//               lessonId,
//               documentId,
//             }).unwrap();
//             dispatch(updateCourseProgress(updateProgressData));

//             const updateAnalyticsData = await updateUserAnalyticsMutation({
//               userId,
//               analyticsData: {
//                 coursesAnalytics: [
//                   {
//                     courseId,
//                     lessonsAnalytics: [
//                       {
//                         lessonId,
//                         documentsAnalytics: [
//                           {
//                             documentId,
//                             timeSpent: timer,
//                             pointsEarned: 15,
//                           },
//                         ],
//                       },
//                     ],
//                   },
//                 ],
//               },
//             }).unwrap();
//             console.log(updateAnalyticsData);
//             dispatch(updateUserAnalytics(updateAnalyticsData));

//             setIframeContent("");
//             navigate(
//               `/course/${courseId}/lesson/${lessonId}/document/${documentId}/complete`,
//               { state: { formattedTime } }
//             );
//           } catch (error) {
//             console.log(error);
//           }
//         } else {
//           navigate(
//             `/course/${courseId}/lesson/${lessonId}/quiz/${nextQuiz._id}`
//           );
//         }
//       }
//     }
//   }

//   const handleBack = () => {
//     if (currentIndex > 0) {
//       const newIndex = currentIndex - 1;
//       setCurrentIndex(newIndex);
//       setDisplayedContent((prevContent) =>
//         prevContent.slice(0, prevContent.length - 1)
//       );
//     }
//   };

//   const handleRunJavaScriptConsole = (code, supportingCode) => {
//     let iframeContent = `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Output</title>
//       </head>
//       <body>
//         <script>
//           (function() {
//             const originalConsoleLog = console.log;
//             let consoleOutput = "";

//             console.log = function(...args) {
//               // Convert objects and arrays to a readable format
//               const formattedArgs = args.map(arg => {
//                 if (typeof arg === 'object') {
//                   try {
//                     return JSON.stringify(arg, null, 2);
//                   } catch (e) {
//                     return String(arg);
//                   }
//                 }
//                 return String(arg);
//               });
//               consoleOutput += formattedArgs.join(' ') + '\\n';
//               originalConsoleLog.apply(console, arguments);
//               document.body.innerHTML = "<pre>" + consoleOutput + "</pre>";
//             };

//             ${supportingCode ? supportingCode : ""}
//             ${code}
//           })();
//         </script>
//       </body>
//       </html>
//     `;
//     setIframeContent(iframeContent);
//   };

//   const handleRunCode = (code, supportingCode, language) => {
//     console.log(language);
//     let iframeContent = `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Output</title>
//         ${language === "css" ? `<style>${code}</style>` : ""}
//       </head>
//       <body>
//       ${language === "html" ? `${code}` : ""}
//         ${supportingCode ? supportingCode : ""}
//         ${language === "javascript" ? `<script>${code}</script>` : ""}
//       </body>
//       </html>
//     `;
//     setIframeContent(iframeContent);
//   };

//   const progressPercentage = documentContent
//     ? ((currentIndex + 1) / documentContent.length) * 100
//     : 0;

//   return (
//     <div className="flex-1 p-4">

//       <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
//       <h1 className="text-2xl font-bold mb-4">
//         {document ? document.title : "Quiz"}

//       </h1>
//       <hr />
//       {document ? (
//         <TransitionGroup>
//           {displayedContent.map((content, index) => (
//             <CSSTransition
//               key={index}
//               classNames="fade"
//               timeout={300}
//               appear={true}
//             >
//               <div>
//                 {content.type === "sentence" ? (
//                   // <ContentRenderer><p className="my-4">{content.text}</p>
//                   <ContentRenderer content ={content.text} />
//                 ) : content.type === "snippet" ? (
//                   <div className="my-4 bg-gray-200 p-4 rounded">
//                     <pre>
//                       <code>{content.code}</code>
//                     </pre>
//                   </div>
//                 ) : content.type === "code" ? (
//                   <div className="my-4 bg-gray-200 p-4 rounded">
//                     {content.supportingCode && (
//                       <div className="my-2 bg-gray-100 p-2 rounded">
//                         <pre>
//                           <code>{content.supportingCode}</code>
//                         </pre>
//                       </div>
//                     )}
//                     <Editor
//                       height="200px"
//                       defaultLanguage={content.language}
//                       defaultValue={content.code}
//                       options={{readOnly:true}}
//                     />
//                     <button
//                       className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
//                       onClick={() =>
//                         handleRunCode(
//                           content.code,
//                           content.supportingCode,
//                           content.language
//                         )
//                       }
//                     >
//                       Run
//                     </button>
//                     <iframe
//                       srcDoc={iframeContent}
//                       title="Output"
//                       className="w-full h-64 mt-4 border"
//                     />
//                   </div>
//                 ) : content.type === "codeconsole" ? (
//                   <div className="my-4 bg-gray-200 p-4 rounded">
//                     <Editor
//                       height="200px"
//                       defaultLanguage="javascript"
//                       defaultValue={content.code}
//                       options={{readOnly:true}}
//                       onChange={(value) => {
//                         handleRunJavaScriptConsole(value, content.supportingCode);
//                       }}
//                     />
//                     <button
//                       className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
//                       onClick={() =>
//                         handleRunJavaScriptConsole(
//                           content.code,
//                           content?.supportingCode
//                         )
//                       }
//                     >
//                       Run
//                     </button>
//                     <iframe
//                       srcDoc={iframeContent}
//                       title="Output"
//                       className="w-full h-64 mt-4 border"
//                     />
//                   </div>
//                 ) : null
//                 }
//               </div>
//             </CSSTransition>
//           ))}
//         </TransitionGroup>
//       ) : (
//         <QuizContent
//           quizId={quizId}
//           quiz={quiz}
//           onNext={handleNext}
//           onBack={handleBack}
//         />
//       )}
//       {document && (
//         <div
//           className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-md flex justify-between items-center"
//           style={{ zIndex: 1000 }}
//         >
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
//             onClick={handleBack}
//             disabled={currentIndex === 0}
//           >
//             Back
//           </button>
//           <div
//             className="progress-bar"
//             style={{
//               width: `${progressPercentage}%`,
//               backgroundColor: `rgba(0, 128, 0, ${progressPercentage / 100})`,
//               height: 20,
//               borderRadius: 10,
//             }}
//           />
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
//             onClick={handleNext}
//           >
//             {documentContent && currentIndex === documentContent.length - 1
//               ? "Finish"
//               : "Next"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DocumentContent;
