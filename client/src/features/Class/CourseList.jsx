import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

function CourseList() {
  const courseName = useSelector((state) => state.course.courseData);
  const navigate = useNavigate();

  function handleOnClick() {
    navigate(`/course`);
  }

  return (
    <>
      {courseName.map((course) => {
        return (
      
            <li className="text-white" key={course._id}>
              {course.name}
            </li>
      
        );
      })}
      <button type="button" onClick={handleOnClick}>
        START NOW
      </button>
    </>
  );
}
export default CourseList;
