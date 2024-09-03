import { useSelector } from "react-redux";

import HomeContent from "./HomeContent";
import StudentsHome from "./Students UI/StudentsHome";
import TeachersHome from "./Teacher UI/TeachersHome";
import { useNavigate } from "react-router";
import { useEffect } from "react";

function Home() {
  const isAuthenticated = localStorage.getItem("userDetails");
  const navigate = useNavigate("");
  const user = useSelector((state) => state.user.userDetails);

  useEffect(() => {
    isAuthenticated && user?.role === "teacher" ? navigate(`/classes`) : user?.role === "admin" ? navigate('admin-dashboard'): user?.role === "student" ? navigate(`/${user._id}`) : navigate('/')
  }, [isAuthenticated]);

  return (
    <div>
      

      {!isAuthenticated && <HomeContent />}
    </div>
  );
}
export default Home;
