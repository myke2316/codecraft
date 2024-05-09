import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { setCredentials } from "../features/LoginRegister/userSlice";
import { BACKEND_URL } from "../constants";

function GoogleRedirect() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = localStorage.getItem("userDetails");
  async function getUser() {
    try {
      const res = await axios.get(`${BACKEND_URL}/auth/login/success`, {
        withCredentials: true,
      });
      dispatch(
        setCredentials({
          ...res.data.user._json,
          _id: res.data._id,
          role: res.data.user.role,
        })
      );
      navigate("/");
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      getUser();
    } else {
      console.log("already authenticated(user info wont reload or redispatch)");
    }
  }, [isAuthenticated]);
  return <div>REDIRECTING PLEASE WAIT</div>;
}
export default GoogleRedirect;
