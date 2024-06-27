import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

function CourseList() {
  const courseName = useSelector((state) => state.course.courseData);
  const navigate = useNavigate();

  function handleOnClick(courseId) {
    navigate(`/course/${courseId}`);
  }

  return (
    <>
      {courseName.map((course) => {
        return (
          <li className="text-white">
            <button
              type="button"
              onClick={() => handleOnClick(course._id)}
              key={course._id}
            >
              {course.name}
            </button>
          </li>
        );
      })}
    </>
  );
}
export default CourseList;
