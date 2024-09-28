import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { setCredentials } from "../features/LoginRegister/userSlice";
import { BACKEND_URL } from "../constants";
import { useFetchClassMutation } from "../features/Teacher/classService";
import { setClass } from "../features/Teacher/classSlice";
import { setCourse } from "../features/Class/courseSlice";
import { useGetCourseDataMutation } from "../features/Class/courseService";
import { setUserProgress } from "../features/Student/studentCourseProgressSlice";
import { useFetchUserProgressMutation } from "../features/Student/studentCourseProgressService";
import { useFetchUserAnalyticsMutation } from "../features/Student/userAnalyticsService";
import { setUserAnalytics } from "../features/Student/userAnalyticsSlice";
import { useFetchUserQuizSubmissionMutation } from "../features/Course/Quiz/quizSubmissionService";
import { getQuizSubmission } from "../utils/quizSubmissionUtil";
import { useFetchUserActivitySubmissionMutation } from "../features/Course/CodingActivity/activitySubmissionService";
import { getActivitySubmissions } from "../utils/activitySubmissionUtil";
import { useGetUserMutation } from "../features/LoginRegister/userService";

function GoogleRedirect() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fetchClass, { isLoading }] = useFetchClassMutation();
  const isAuthenticated = localStorage.getItem("userDetails");
  const userDetails = useSelector((state) => state.user.userDetails);

  const [fetchUserQuizSubmission, { isLoading: isLoadingFetchQuizSubmission }] =
    useFetchUserQuizSubmissionMutation();

  const [
    fetchUserActivitySubmission,
    { isLoading: isLoadingFetchActivitySubmission },
  ] = useFetchUserActivitySubmissionMutation();
  const [getUserApi] = useGetUserMutation();
  async function getUser(values) {
    try {
      const res = await axios.get(`${BACKEND_URL}/auth/login/success`, {
        withCredentials: true,
      });
    
      const { user, _id, message, isNewUser } = res.data;
      const userId = _id
      const userData = await getUserApi(userId).unwrap(); 
      console.log(userData)
      dispatch(
        setCredentials({
          ...user._json, // Using destructured 'user' instead of 'res.data.user'
          _id: _id,
          role: user.role,
          approved: user.approved,
          userData:userData // Using destructured 'user' instead of 'res.data.user'
        })
      );
      
      if (userDetails) {
        console.log(userDetails);
        fetchProgress();
        fetchAnalytics();
        getQuizSubmission(dispatch, fetchUserQuizSubmission, userDetails._id);
        getActivitySubmissions(
          dispatch,
          fetchUserActivitySubmission,
          userDetails._id
        );
      }

      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (!user.role) {
        navigate("/role-selection");
      } else {
        getClass(user.role);
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }
  //=============
  async function getClass(role) {
    try {
      // Ensure user details exist in localStorage
      const userDetails = JSON.parse(localStorage.getItem("userDetails"));
      if (!userDetails || !userDetails._id) {
        console.error("User details not found or missing user ID");
        return;
      }

      // Access the user ID
      const userId = userDetails._id;

      // Fetch class using the user ID
      const classData = await fetchClass(userId).unwrap();
      if (classData && classData.length > 0) {
        dispatch(setClass(classData));
      } else {
        dispatch(setClass([]));
        // toast.error("No classess fetched");
      }
      console.log(userDetails);
      if (userDetails.role === "teacher") {
        navigate("/classes");
      } else {
        navigate(`/${userDetails._id}`);
      }
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error(error?.data?.message || error?.error);
    }
  }
  //=============
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
  //==============
  const [fetchCourseData, { isLoading: isLoadingCourse }] =
    useGetCourseDataMutation();
  async function fetchCourse() {
    try {
      const courseData = await fetchCourseData().unwrap();
      dispatch(setCourse(courseData || []));
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error?.response?.data?.message || error.message);
    }
  }

  //============

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
    if (!isAuthenticated || !isAuthenticated.roles) {
      fetchCourse();
      getUser();
    } else {
      console.log("already authenticated(user info wont reload or redispatch)");
    }
  }, [isAuthenticated]);

  return <>Redirecting</>;
}
export default GoogleRedirect;
