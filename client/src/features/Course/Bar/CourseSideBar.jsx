import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

function CourseSideBar() {
  // course data
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);

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

  function handleLessonClick(lessonId, courseId) {
    navigate(`/course/${courseId}/lesson/${lessonId}`);
  }

  function handleDocumentClick(courseId, documentId, lessonId) {
    navigate(`/course/${courseId}/lesson/${lessonId}/document/${documentId}`);
  }

  return (
    <div
      className="resizable"
      style={{ width: sidebarWidth }}
      onMouseDown={handleResize}
    >
      <div className="p-4 bg-gray-200 overflow-hidden divide-y divide-blue-200">
        {courses.map((course) => (
          <div key={course._id}>
            <h2 className="text-lg font-bold mb-2 truncate">
              Course: {course.name}
            </h2>

            <ul className="mb-4 ml-5">
              {course.lessons.map((lesson) => (
                <div key={lesson._id}>
                  <li
                    className="cursor-pointer text-blue-800 hover:text-black"
                    onClick={() => handleLessonClick(lesson._id, course._id)}
                  >
                    {lesson.title}
                  </li>
                  <ul>
                    {lesson.documents.map((document) => (
                      <li
                        key={document._id}
                        className="cursor-pointer ml-10 text-blue-300 hover:text-blue-700"
                        onClick={() =>
                          handleDocumentClick(
                            course._id,
                            document._id,
                            lesson._id
                          )
                        }
                      >
                        {document.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="resizer" />
    </div>
  );
}

export default CourseSideBar;
