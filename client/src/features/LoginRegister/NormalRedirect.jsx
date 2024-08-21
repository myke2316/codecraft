import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { useFetchClassMutation } from "../Teacher/classService";
import { setClass } from "../Teacher/classSlice";
import { useGetCourseDataMutation } from "../Class/courseService";
import { setCourse } from "../Class/courseSlice";
import { useFetchUserProgressMutation } from "../Student/studentCourseProgressService";
import { setUserProgress } from "../Student/studentCourseProgressSlice";
import { useFetchUserAnalyticsMutation } from "../Student/userAnalyticsService";
import { setUserAnalytics } from "../Student/userAnalyticsSlice";
import { useFetchUserQuizSubmissionMutation } from "../Course/Quiz/quizSubmissionService";
import { getQuizSubmission } from "../../utils/quizSubmissionUtil";
import { useFetchUserActivitySubmissionMutation } from "../Course/CodingActivity/activitySubmissionService";
import { getActivitySubmissions } from "../../utils/activitySubmissionUtil";

function NormalRedirect() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [fetchUserQuizSubmission, { isLoading: isLoadingFetchQuizSubmission }] =
    useFetchUserQuizSubmissionMutation();

  const [
    fetchUserActivitySubmission,
    { isLoading: isLoadingFetchActivitySubmission },
  ] = useFetchUserActivitySubmissionMutation();

  const [fetchClass, { isLoading }] = useFetchClassMutation();
  const userDetails = useSelector((state) => state.user.userDetails);

  async function getClass(role) {
    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails"));
      if (!userDetails || !userDetails._id) {
        console.error("User details not found or missing user ID");
        return;
      }

      const userId = userDetails._id;
      const classData = await fetchClass(userId).unwrap();

      dispatch(setClass(classData || []));
      fetchProgress();
      fetchCourse();
      fetchAnalytics();
      getQuizSubmission(dispatch, fetchUserQuizSubmission, userId);
      getActivitySubmissions(
        dispatch,
        fetchUserActivitySubmission,
        userDetails._id
      );
      if(userDetails.role === "teacher"){
        navigate("/classes")
      }else{

        navigate(`/${userDetails._id}`);
      }
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error(error?.response?.data?.message || error.message);
    }
  }

  const [fetchUserProgress, { isLoading: isLoadingFetch }] =
    useFetchUserProgressMutation();
  async function fetchProgress() {
    try {
      const userProgressData = await fetchUserProgress({
        userId: userDetails._id,
      }).unwrap();
      dispatch(setUserProgress(userProgressData));
      console.log(userProgressData);

      if (!userProgressData) {
        console.log("no user progress yet.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || error.data);
    }
  }

  const [fetchCourseData, { isLoading: isLoadingCourse }] =
    useGetCourseDataMutation();
  async function fetchCourse() {
    try {
      const courseData = await fetchCourseData().unwrap();
      dispatch(setCourse(courseData));
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error?.response?.data?.message || error.message);
    }
  }

  const [fetchUserAnalytics, { isLoading: isLoadingAnalytics }] =
    useFetchUserAnalyticsMutation();
  async function fetchAnalytics() {
    try {
      const userAnalyticsData = await fetchUserAnalytics({
        userId: userDetails._id,
      }).unwrap();
      dispatch(setUserAnalytics(userAnalyticsData));
      console.log(userAnalyticsData);

      if (!userAnalyticsData) {
        console.log("no user analytics yet.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || error.data);
    }
  }

  useEffect(() => {
    if (userDetails && userDetails.role) {
      getClass(userDetails.role);
    }
  }, [userDetails]);

  return <>Redirecting</>;
}

export default NormalRedirect;
