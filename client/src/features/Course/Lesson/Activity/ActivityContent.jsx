// import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router";
// import { useSelector } from "react-redux";
// import Editor from "@monaco-editor/react";
// import "./activityContent.css";

// const ActivityContent = () => {
//   const { courseId, lessonId } = useParams();
//   const courses = useSelector((state) => state.course.courseData);

//   const [codingActivity, setCodingActivity] = useState(null);
//   const [code, setCode] = useState("");
//   const [fileExplorer, setFileExplorer] = useState([]);
//   const [iframeContent, setIframeContent] = useState("");
//   const [expectedOutput, setExpectedOutput] = useState("");

//   const sidebarRef = useRef(null);
//   const fileExplorerRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const outputContainerRef = useRef(null);

//   const [isResizing, setIsResizing] = useState(false);
//   const [resizeDirection, setResizeDirection] = useState(null);

//   useEffect(() => {
//     if (courses) {
//       const course = courses.find((course) => course._id === courseId);
//       if (course) {
//         const lesson = course.lessons.find((lesson) => lesson._id === lessonId);
//         if (lesson && lesson.codingActivity) {
//           const activity = lesson.codingActivity[0]; // Assuming there's only one coding activity per lesson
//           setCodingActivity(activity);
//           setFileExplorer(activity.files || []);
//           setCode(activity.initialCode || "");
//           setExpectedOutput(activity.expectedOutput || "");

//         }
//       }
//     }
//   }, [courses, courseId, lessonId]);

//   const handleSave = () => {
//     // Save code logic here
//     console.log("Code saved:", code);
//     // Make API call to save the code to the database
//   };

//   const handleRun = () => {
//     // Run code logic here
//     console.log("Code running...");
//     // Inject code into iframe for real-time execution
//     setIframeContent(code);
//   };

//   const handleMouseDown = (e, direction) => {
//     setIsResizing(true);
//     setResizeDirection(direction);
//     document.body.classList.add("disable-selection");
//   };

//   const handleMouseMove = (e) => {
//     if (!isResizing) return;

//     if (resizeDirection === "sidebar") {
//       const newWidth = Math.max(200, e.clientX);
//       sidebarRef.current.style.width = `${newWidth}px`;
//     } else if (resizeDirection === "fileExplorer") {
//       const newHeight = Math.max(100, e.clientY - sidebarRef.current.offsetTop);
//       fileExplorerRef.current.style.height = `${newHeight}px`;
//     } else if (resizeDirection === "editor") {
//       const editorContainerWidth = Math.max(
//         300,
//         e.clientX - sidebarRef.current.offsetWidth
//       );
//       editorContainerRef.current.style.width = `${editorContainerWidth}px`;
//       const remainingWidth =
//         window.innerWidth -
//         editorContainerWidth -
//         sidebarRef.current.offsetWidth;
//       const newOutputWidth = Math.max(150, remainingWidth / 2);
//       outputContainerRef.current.style.width = `${newOutputWidth}px`;
//     } else if (resizeDirection === "output") {
//       const remainingHeight = window.innerHeight - e.clientY;
//       outputContainerRef.current.style.height = `${remainingHeight}px`;
//     }
//   };

//   const handleMouseUp = () => {
//     setIsResizing(false);
//     setResizeDirection(null);
//     document.body.classList.remove("disable-selection");
//   };

//   useEffect(() => {
//     const handleWindowMouseMove = (e) => {
//       if (!isResizing) return;
//       handleMouseMove(e);
//     };

//     const handleWindowMouseUp = () => {
//       handleMouseUp();
//     };

//     window.addEventListener("mousemove", handleWindowMouseMove);
//     window.addEventListener("mouseup", handleWindowMouseUp);

//     return () => {
//       window.removeEventListener("mousemove", handleWindowMouseMove);
//       window.removeEventListener("mouseup", handleWindowMouseUp);
//     };
//   }, [isResizing]);

//   return (
//     <div className="activity-content">
//       <div ref={sidebarRef} className="sidebar">
//         <h4>File Explorer</h4>
//         <ul ref={fileExplorerRef} className="file-explorer">
//           {fileExplorer.map((file, index) => (
//             <li key={index}>{file.name}</li>
//           ))}
//         </ul>
//         <div
//           className="resizer resizer-fileExplorer"
//           onMouseDown={(e) => handleMouseDown(e, "fileExplorer")}
//         />
//         <div className="sidebar-bottom">
//           <h3>Activity Description</h3>
//           <p>{codingActivity?.description}</p>
//           <h3>Activity Question</h3>
//           <p>{codingActivity?.question}</p>
//           <h3>Expected Output</h3>
//           <iframe
//             srcDoc={expectedOutput}
//             title="Expected Output"
//             sandbox="allow-scripts"
//             frameBorder="0"
//             width="100%"
//             height="200px"
//           ></iframe>
//         </div>
//         <div
//           className="resizer resizer-sidebar"
//           onMouseDown={(e) => handleMouseDown(e, "sidebar")}
//         />
//       </div>
//       <div ref={editorContainerRef} className="editor-container">
//         <Editor
//           height="50vh"
//           defaultLanguage={codingActivity?.language || "javascript"}
//           value={code}
//           onChange={(value) => setCode(value)}
//           theme="vs-dark"
//         />
//         <div className="button-group">
//           <button onClick={handleSave} className="activity-button">
//             Save
//           </button>
//           <button onClick={handleRun} className="activity-button">
//             Run
//           </button>
//         </div>
//         <div
//           className="resizer resizer-editor"
//           onMouseDown={(e) => handleMouseDown(e, "editor")}
//         />
//       </div>
//       <div ref={outputContainerRef} className="output-container">
//         <h3>Output</h3>
//         <iframe
//           srcDoc={iframeContent}
//           title="Output"
//           sandbox="allow-scripts"
//           frameBorder="0"
//           width="100%"
//           height="100%"
//         ></iframe>
//         <div
//           className="resizer resizer-output"
//           onMouseDown={(e) => handleMouseDown(e, "output")}
//         />
//       </div>
//     </div>
//   );
// };

// export default ActivityContent;

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useUpdateUserProgressMutation } from "../../../Student/studentCourseProgressService";
import { updateCourseProgress } from "../../../Student/studentCourseProgressSlice";
import { useState } from "react";
const ActivityContent = () => {
  const { courseId, lessonId, activityId } = useParams();
  const userId = useSelector((state) => state.user.userDetails._id);
  const courses = useSelector((state) => state.course.courseData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [updateUserProgress, { isLoading: isLoadingUpdateUserProgress }] =
    useUpdateUserProgressMutation();

  async function handleNext() {
    try {
      // Get the current lesson and course
      const course = courses.find((course) => course._id === courseId);
      const lesson = course.lessons.find((lesson) => lesson._id === lessonId);

      // Get the current activity
      const codingActivity = lesson.codingActivity;
      // Update user progress
      const updateData = await updateUserProgress({
        userId,
        courseId,
        lessonId,
        activityId: codingActivity[currentActivityIndex]._id,
      }).unwrap();
      dispatch(updateCourseProgress(updateData));

      // Check if there's a next activity
      if (currentActivityIndex < codingActivity.length - 1) {
        // Navigate to the next activity
        setCurrentActivityIndex(currentActivityIndex + 1);
      } else {
        // Navigate to the next lesson
        const nextLesson = course.lessons[course.lessons.indexOf(lesson) + 1];
        if (nextLesson) {
          navigate(
            `/course/${courseId}/lesson/${nextLesson._id}/document/${nextLesson.documents[0]._id}`
          );
        } else {
          // Navigate to the next course
          const nextCourse = courses[courses.indexOf(course) + 1];
          if (nextCourse) {
            navigate(
              `/course/${nextCourse._id}/lesson/${nextCourse.lessons[0]._id}/document/${nextCourse.lessons[0].documents[0]._id}`
            );
          }
          // else {
          //   // No more courses, navigate to a completion page or dashboard
          //   navigate('/dashboard');
          // }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
      CODING ACTIVITY SOON
      <button onClick={handleNext}>Next</button>
    </div>
  );
};
export default ActivityContent;
