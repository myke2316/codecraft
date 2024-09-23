
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
