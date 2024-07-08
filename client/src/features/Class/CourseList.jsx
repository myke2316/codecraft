import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  useCreateUserProgressMutation,
  useFetchUserProgressMutation,
} from "../Student/studentCourseProgressService";
import { setUserProgress } from "../Student/studentCourseProgressSlice";
import { toast } from "react-toastify";

function CourseList() {
  const courseName = useSelector((state) => state.course.courseData);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [createUserProgress, { isLoading }] = useCreateUserProgressMutation();
  const [fetchUserProgress, { isLoading: isLoadingFetch }] =
    useFetchUserProgressMutation();

  const user = useSelector((state) => state.user.userDetails);
  async function handleOnClick() {
    try {
      const existingProgress = await fetchUserProgress({
        userId: user._id,
      }).unwrap();
     
      if (!existingProgress) {
        await createUserProgress({
          userId: user._id,
        }).unwrap();
        dispatch(setUserProgress(createUserProgress));
      } else {
        navigate("/course");
      }
    } catch (error) {
      console.error("Error:", error);

      toast.error(error.message || error.data);
    }
  }

  return (
    <>
      {courseName?.map((course) => {
        return (
          <li className="text-white" key={course._id}>
            {course?.name}
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
