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

function GoogleRedirect() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fetchClass, { isLoading }] = useFetchClassMutation();
  const isAuthenticated = localStorage.getItem("userDetails");
  const userDetails = useSelector((state) => state.user.user);
  async function getUser(values) {
    try {
      const res = await axios.get(`${BACKEND_URL}/auth/login/success`, {
        withCredentials: true,
      });

      const { user, _id, message, isNewUser } = res.data;

      dispatch(
        setCredentials({
          ...user._json, // Using destructured 'user' instead of 'res.data.user'
          _id: _id,
          role: user.role, // Using destructured 'user' instead of 'res.data.user'
        })
      );

      if (!user.role) {
        navigate("/role-selection");
      } else {
        getClass(user.role);
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }

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

      navigate(`/${userDetails._id}`);
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error(error?.data?.message || error?.error);
    }
  }
  const [fetchCourseData, { isLoading: isLoadingCourse }] =
    useGetCourseDataMutation();
  async function getCourse() {
    try {
      const courseData = await fetchCourseData().unwrap();
      dispatch(setCourse(courseData || []));
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error?.response?.data?.message || error.message);
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !isAuthenticated.roles) {
      //getCourse();
      getUser();
    } else {
      console.log("already authenticated(user info wont reload or redispatch)");
    }
  }, [isAuthenticated]);

  return <>Redirecting</>;
}
export default GoogleRedirect;
