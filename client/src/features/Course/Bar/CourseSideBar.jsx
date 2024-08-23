import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

function CourseSidebar() {
  const navigate = useNavigate();
  const courses = useSelector((state) => state.course.courseData);
  const userProgress = useSelector(
    (state) => state.studentProgress.userProgress
  );

  const [sidebarWidth, setSidebarWidth] = useState("250px");
  const handleResize = (e) => {
    const startX = e.clientX;
    const startWidth = parseInt(sidebarWidth, 10);
    const minWidth = 50;
    const maxWidth = 400;
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
        {courses.map((course) => {
          const courseProgress = userProgress.coursesProgress.find(
            (cp) => cp.courseId.toString() === course._id.toString()
          );
          if (!courseProgress) return null;

          return (
            <div key={course._id}>
              <h2 className="text-lg font-bold mb-2 truncate">
                Course: {course.title}
              </h2>
              <ul className="mb-4 ml-5">
                {course.lessons.map((lesson) => {
                  const lessonProgress = courseProgress.lessonsProgress.find(
                    (lp) => lp.lessonId.toString() === lesson._id.toString()
                  );
                  if (!lessonProgress) return null;
                
                  const isLessonUnlocked = !lessonProgress.locked;

                  return (
                    <div key={lesson._id}>
                      <li
                        className={`cursor-pointer text-blue-800 hover:text-black ${
                          isLessonUnlocked
                            ? ""
                            : "opacity-50 cursor-not-allowed"
                        }`}
                        onClick={() =>
                          isLessonUnlocked &&
                          handleLessonClick(lesson._id, course._id)
                        }
                      >
                        {lesson.title}
                      </li>
                      {isLessonUnlocked ? (
                        <ul>
                          {lesson.documents.map((document) => {
                            const documentProgress =
                              lessonProgress.documentsProgress.find(
                                (dp) =>
                                  dp.documentId.toString() ===
                                  document._id.toString()
                              );
                            if (!documentProgress) return null;

                            const isDocumentUnlocked = !documentProgress.locked;

                            return (
                              <li
                                key={document._id}
                                className={`cursor-pointer ml-10 text-blue-800 hover:text-blue-700 ${
                                  isDocumentUnlocked
                                    ? ""
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                                onClick={() =>
                                  isDocumentUnlocked &&
                                  handleDocumentClick(
                                    course._id,
                                    document._id,
                                    lesson._id
                                  )
                                }
                              >
                                {document.title}
                              </li>
                            );
                          })}
                        </ul>
                      ):
                      (
                        <ul>
                          {lesson.documents.map((document) => {
                            const documentProgress =
                              lessonProgress.documentsProgress.find(
                                (dp) =>
                                  dp.documentId.toString() ===
                                  document._id.toString()
                              );
                            if (!documentProgress) return null;

                            const isDocumentUnlocked = !documentProgress.locked;

                            return (
                              <li
                                key={document._id}
                                className={`cursor-pointer ml-10 text-blue-800 hover:text-blue-700 ${
                                  isDocumentUnlocked
                                    ? ""
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                                onClick={() =>
                                  isDocumentUnlocked &&
                                  handleDocumentClick(
                                    course._id,
                                    document._id,
                                    lesson._id
                                  )
                                }
                              >
                                {document.title}
                              </li>
                            );
                          })}
                        </ul>
                      )
                      }
                    </div>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="resizer" />
    </div>
  );
}

function isLessonUnlocked(userProgress, courseId, lessonId) {
  const courseProgress = userProgress.coursesProgress.find(
    (cp) => cp.courseId.toString() === courseId.toString()
  );

  if (!courseProgress) return false;
  const lessonProgress = courseProgress.lessonsProgress.find(
    (lp) => lp.lessonId.toString() === lessonId.toString()
  );
  return lessonProgress && !lessonProgress.locked;
}

function isDocumentUnlocked(userProgress, courseId, lessonId, documentId) {
  const courseProgress = userProgress.coursesProgress.find(
    (cp) => cp.courseId.toString() === courseId.toString()
  );
  if (!courseProgress) return false;
  const lessonProgress = courseProgress.lessonsProgress.find(
    (lp) => lp.lessonId.toString() === lessonId.toString()
  );
  if (!lessonProgress) return false;
  const documentProgress = lessonProgress.documentsProgress.find(
    (dp) => dp.documentId.toString() === documentId.toString()
  );
  return documentProgress && !documentProgress.locked;
}

export default CourseSidebar;
