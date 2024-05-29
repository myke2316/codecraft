import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { setCredentials } from "../features/LoginRegister/userSlice";
import { BACKEND_URL } from "../constants";
import { useFetchClassMutation } from "../features/Teacher/classService";
import { setClass } from "../features/Teacher/classSlice";

function GoogleRedirect() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fetchClass, { isLoading }] = useFetchClassMutation();
  const isAuthenticated = localStorage.getItem("userDetails");
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
      } else if (user.role === "teacher") {
        getClass();
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }

  async function getClass(values) {
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

      const res = await fetchClass(userId);
      const classData = res.data
      if (res) {
        dispatch(setClass(classData));
      }
      console.log(classData);
      navigate("/");
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error(error?.data?.message || error?.error);
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !isAuthenticated.roles) {
      getUser();
    } else {
      console.log("already authenticated(user info wont reload or redispatch)");
    }
  }, [isAuthenticated]);
  return <>Redirecting</>;
}
export default GoogleRedirect;
