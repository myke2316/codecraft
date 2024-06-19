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
    isAuthenticated && navigate(`/${user._id}`);
  }, [isAuthenticated]);

  return (
    <div>
      {isAuthenticated && navigate(`/${user._id}`)}

      {!isAuthenticated && <HomeContent />}
    </div>
  );
}
export default Home;
