import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCredentials } from "../features/LoginRegister/userSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { BACKEND_URL } from "../constants";
import HomeContent from "./HomeContent";
import StudentsHome from "./Students UI/StudentsHome";
import TeachersHome from "./Teacher UI/TeachersHome";

function Home() {
  const isAuthenticated = localStorage.getItem("userDetails");
  const user = useSelector((state) => state.user.userDetails);

  return (
    <div>
      {isAuthenticated && user.role === "student" && <StudentsHome />}
      {isAuthenticated && user.role === "teacher" && <TeachersHome />}
      {!isAuthenticated && <HomeContent />}
    </div>
  );
}
export default Home;
