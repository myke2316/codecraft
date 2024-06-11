import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { useFetchClassMutation } from "../Teacher/classService";
import { setClass } from "../Teacher/classSlice";

function NormalRedirect() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      navigate(`/${userDetails._id}`);
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error(error?.response?.data?.message || error.message);
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
