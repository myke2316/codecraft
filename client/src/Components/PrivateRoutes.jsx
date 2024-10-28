import { useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router";
import AuthorizedLayout from "../features/Authorized/AuthorizedLayout";
import { useEffect, useState } from "react";
import { useGetUserMutation } from "../features/LoginRegister/userService";
function PrivateRoutes() {
  const userInfo = useSelector((state) => state.user.userDetails);
  const storedData = JSON.parse(localStorage.getItem("userDetails")); 
  const userId = storedData?._id

  const [isUserDeleted, setIsUserDeleted] = useState(false);
  const [getUser] = useGetUserMutation();
  const navigate = useNavigate()
  useEffect(() => {
    async function verifyUser() {
      if (userId && !isUserDeleted) {
        try {
          const res = await getUser(userId).unwrap(); // No need to store response as we’re only checking existence
          console.log(res)
         // Check if the response is an empty array
         if (Array.isArray(res) && res.length === 0) {
          navigate('/login')
          localStorage.clear();
          setIsUserDeleted(true);
        }
        } catch (error) {
          if (error?.status === 404) {
            navigate('/login')
            localStorage.clear();
            setIsUserDeleted(true);
          }
        }
      }
    }

    verifyUser();
  }, [userId, getUser, isUserDeleted]);
  // If user is deleted, redirect to login
  if (isUserDeleted) {
    return <Navigate to="/login" replace />;
  }

  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
}
export default PrivateRoutes;
