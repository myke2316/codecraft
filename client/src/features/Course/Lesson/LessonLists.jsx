import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

function LessonLists({ lesson, documentId }) {
  const { courseId, lessonId } = useParams();
  const courses = useSelector((state) => state.course.courseData);
  const course = courses.find((course) => course._id === courseId);

  const navigate = useNavigate();
  function handleLesson() {
    navigate(`/course/${courseId}/lesson/${lessonId}/document/${documentId}`);
  }

  return (
    <li className="cursor-pointer" onClick={handleLesson}>
      {lesson.title}
    </li>
  );
}
export default LessonLists;
