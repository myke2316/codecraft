import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import LessonLists from "../Lesson/LessonLists";

function CourseSideBar() {
  //course data
  const { courseId } = useParams();
  const courses = useSelector((state) => state.course.courseData);
  const course = courses.find((course) => course._id === courseId);

  const [sidebarWidth, setSidebarWidth] = useState("250px");
  const handleResize = (e) => {
    const startX = e.clientX;
    const startWidth = parseInt(sidebarWidth, 10);
    const minWidth = 50; // minimum width
    const maxWidth = 400; // maximum width
    const handleMouseMove = (e) => {
      const newWidth = Math.min(
        Math.max(startWidth + (e.clientX - startX), minWidth),
        maxWidth
      );
      setSidebarWidth(`${newWidth}px`);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", handleMouseMove);
    });
  };
  return (
    <div
      className="resizable"
      style={{ width: sidebarWidth }}
      onMouseDown={handleResize}
    >
      <div className="p-4 bg-gray-200 overflow-hidden">
        <h2 className="text-lg font-bold mb-4 truncate">
          Course : {course.name}
        </h2>
        <ul>
          {course.lessons.map((lesson) => (
            <LessonLists lesson={lesson} />
          ))}
        </ul>
      </div>

      <div className="resizer" />
    </div>
  );
}
export default CourseSideBar;
