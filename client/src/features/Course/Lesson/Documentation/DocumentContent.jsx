// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useNavigate } from "react-router";
// import { TransitionGroup, CSSTransition } from "react-transition-group";
// import QuizContent from "../Quiz/QuizContent";
// import Editor from "@monaco-editor/react";
// import { useUpdateUserProgressMutation } from "../../../Student/studentCourseProgressService";
// import { updateCourseProgress } from "../../../Student/studentCourseProgressSlice";

// function DocumentContent() {
//   const { courseId, lessonId, documentId, quizId } = useParams();
//   const navigate = useNavigate();
//   const courses = useSelector((state) => state.course.courseData);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [displayedContent, setDisplayedContent] = useState([]);
//   const [documentContent, setDocumentContent] = useState(null);
//   const [iframeContent, setIframeContent] = useState("");

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
//             }
//           } else if (lesson.quiz && lesson.quiz.length > 0) {
//             setDocumentContent(lesson.quiz);
//             setCurrentIndex(0);
//           }
//         }
//       }
//     }
//   }, [courses, courseId, lessonId, documentId, quizId]);

//   if (!courses) return <div>Loading...</div>;

//   const course = courses.find((course) => course._id === courseId);
//   if (!course) return <div>Course not found</div>;

//   const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
//   if (!lesson) return <div>Lesson not found</div>;

//   const document = lesson.documents.find((doc) => doc._id === documentId);
//   const quiz = lesson.quiz;

//   const dispatch = useDispatch();

//   const user = useSelector((state) => state.user.userDetails);
//   const userId = user._id;
//   const [updateUserProgress, { isLoading: isLoadingUpdateUserProgress }] =
//     useUpdateUserProgressMutation();

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

//         try {
//           const updateData = await updateUserProgress({
//             userId,
//             courseId,
//             lessonId,
//             documentId,
//           }).unwrap();
//           dispatch(updateCourseProgress(updateData));

//           navigate(
//             `/course/${courseId}/lesson/${lessonId}/document/${nextDocument._id}`
//           );
//           setIframeContent("");
//         } catch (error) {
//           console.log(error);
//         }
//       } else if (nextQuizIndex < lesson.quiz.length) {
//         const nextQuiz = lesson.quiz[nextQuizIndex];

//         try {
//           const updateData = await updateUserProgress({
//             userId,
//             courseId,
//             lessonId,
//             documentId,
//           }).unwrap();
//           dispatch(updateCourseProgress(updateData));

//           navigate(`/course/${courseId}/lesson/${lessonId}/quiz/${nextQuiz._id}`);
//           setIframeContent("");
//         } catch (error) {
//           console.log(error);
//         }
//       } else if (lesson.codingActivity) {
//         navigate(
//           `/course/${courseId}/lesson/${lessonId}/coding-activity/${lesson.codingActivity._id}`
//         );
//       } else {
//         const nextLessonIndex = course.lessons.indexOf(lesson) + 1;
//         if (nextLessonIndex < course.lessons.length) {
//           const nextLesson = course.lessons[nextLessonIndex];
//           navigate(
//             `/course/${courseId}/lesson/${nextLesson._id}/document/${nextLesson.documents[0]._id}`
//           );
//         } else {
//           console.log("No more lessons left");
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
//         ${language === "js" ? `<script>${code}</script>` : ""}
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
//                   <p className="my-4">{content.text}</p>
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
//                 ) : null}
//               </div>
//             </CSSTransition>
//           ))}
//         </TransitionGroup>
//       ) : (
//         <QuizContent quizId={quizId} quiz={quiz} onNext={handleNext} onBack={handleBack} />
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
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DocumentContent;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import QuizContent from "../Quiz/QuizContent";
import Editor from "@monaco-editor/react";
import { useUpdateUserProgressMutation } from "../../../Student/studentCourseProgressService";
import { updateCourseProgress } from "../../../Student/studentCourseProgressSlice";
import DocumentComplete from "./DocumentComplete";

function DocumentContent() {
  const { courseId, lessonId, documentId, quizId } = useParams();
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedContent, setDisplayedContent] = useState([]);
  const [documentContent, setDocumentContent] = useState(null);
  const [iframeContent, setIframeContent] = useState("");
  const [showCompletion, setShowCompletion] = useState(false);

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
            }
          } else if (lesson.quiz && lesson.quiz.length > 0) {
            setDocumentContent(lesson.quiz);
            setCurrentIndex(0);
            setShowCompletion(false);
          }
        }
      }
    }
  }, [courses, courseId, lessonId, documentId, quizId]);

  if (!courses) return <div>Loading...</div>;

  const course = courses.find((course) => course._id === courseId);
  if (!course) return <div>Course not found</div>;

  const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
  if (!lesson) return <div>Lesson not found</div>;

  const document = lesson.documents.find((doc) => doc._id === documentId);
  const quiz = lesson.quiz;

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.userDetails);
  const userId = user._id;
  const [updateUserProgress, { isLoading: isLoadingUpdateUserProgress }] =
    useUpdateUserProgressMutation();

  async function handleNext() {
    if (documentContent && currentIndex < documentContent.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setDisplayedContent((prevContent) => [
        ...prevContent,
        documentContent[newIndex],
      ]);
      setIframeContent("");
    } else {
      const nextDocumentIndex = lesson.documents.indexOf(document) + 1;
      const nextQuizIndex = lesson.quiz.indexOf(quiz) + 1;

      if (nextDocumentIndex < lesson.documents.length) {
        const nextDocument = lesson.documents[nextDocumentIndex];

        try {
          const updateData = await updateUserProgress({
            userId,
            courseId,
            lessonId,
            documentId,
          }).unwrap();
          dispatch(updateCourseProgress(updateData));

          navigate(
            `/course/${courseId}/lesson/${lessonId}/document/${documentId}/complete`
          );
          setIframeContent("");
        } catch (error) {
          console.log(error);
        }
      } else if (nextQuizIndex < lesson.quiz.length) {
        const nextQuiz = lesson.quiz[nextQuizIndex];

        try {
          const updateData = await updateUserProgress({
            userId,
            courseId,
            lessonId,
            documentId,
          }).unwrap();
          dispatch(updateCourseProgress(updateData));

          // navigate(
          //   `/course/${courseId}/lesson/${lessonId}/quiz/${nextQuiz._id}`
          // );
          setIframeContent("");
          setShowCompletion(true);
        } catch (error) {
          console.log(error);
        }
      } else if (lesson.codingActivity) {
        navigate(
          `/course/${courseId}/lesson/${lessonId}/codingActivity/${lesson.codingActivity._id}`
        );
      } else {
        const nextLessonIndex = course.lessons.indexOf(lesson) + 1;
        if (nextLessonIndex < course.lessons.length) {
          const nextLesson = course.lessons[nextLessonIndex];
          navigate(
            `/course/${courseId}/lesson/${nextLesson._id}/document/${nextLesson.documents[0]._id}`
          );
        } else {
          console.log("No more lessons left");
        }
      }
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setDisplayedContent((prevContent) =>
        prevContent.slice(0, prevContent.length - 1)
      );
    }
  };

  const handleRunCode = (code, supportingCode, language) => {
    console.log(language);
    let iframeContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Output</title>
        ${language === "css" ? `<style>${code}</style>` : ""}
      </head>
      <body>
      ${language === "html" ? `${code}` : ""}
        ${supportingCode ? supportingCode : ""}
        ${language === "js" ? `<script>${code}</script>` : ""}
      </body>
      </html>
    `;
    setIframeContent(iframeContent);
  };

  const progressPercentage = documentContent
    ? ((currentIndex + 1) / documentContent.length) * 100
    : 0;

  if (showCompletion) {
    return <DocumentComplete />;
  }

  return (
    <div className="flex-1 p-4">
      <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
      <h1 className="text-2xl font-bold mb-4">
        {document ? document.title : "Quiz"}
      </h1>
      <hr />
      {document ? (
        <TransitionGroup>
          {displayedContent.map((content, index) => (
            <CSSTransition
              key={index}
              classNames="fade"
              timeout={300}
              appear={true}
            >
              <div>
                {content.type === "sentence" ? (
                  <p className="my-4">{content.text}</p>
                ) : content.type === "snippet" ? (
                  <div className="my-4 bg-gray-200 p-4 rounded">
                    <pre>
                      <code>{content.code}</code>
                    </pre>
                  </div>
                ) : content.type === "code" ? (
                  <div className="my-4 bg-gray-200 p-4 rounded">
                    {content.supportingCode && (
                      <div className="my-2 bg-gray-100 p-2 rounded">
                        <pre>
                          <code>{content.supportingCode}</code>
                        </pre>
                      </div>
                    )}
                    <Editor
                      height="200px"
                      defaultLanguage={content.language}
                      defaultValue={content.code}
                    />
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                      onClick={() =>
                        handleRunCode(
                          content.code,
                          content.supportingCode,
                          content.language
                        )
                      }
                    >
                      Run
                    </button>
                    <iframe
                      srcDoc={iframeContent}
                      title="Output"
                      className="w-full h-64 mt-4 border"
                    />
                  </div>
                ) : null}
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      ) : (
        <QuizContent
          quizId={quizId}
          quiz={quiz}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {document && (
        <div
          className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-md flex justify-between items-center"
          style={{ zIndex: 1000 }}
        >
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleBack}
            disabled={currentIndex === 0}
          >
            Back
          </button>
          <div
            className="progress-bar"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: `rgba(0, 128, 0, ${progressPercentage / 100})`,
              height: 20,
              borderRadius: 10,
            }}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleNext}
          >
            {documentContent && currentIndex === documentContent.length - 1
              ? "Finish"
              : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

export default DocumentContent;
