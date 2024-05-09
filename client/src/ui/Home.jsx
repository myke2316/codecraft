import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCredentials } from "../features/LoginRegister/userSlice";
import { useEffect } from "react";
import { toast } from "react-toastify";
import StudentsHome from "../features/Authorized/Students/StudentsHome";

import { BACKEND_URL } from "../constants";
import HomeContent from "./HomeContent";

function Home() {
  const isAuthenticated = localStorage.getItem("userDetails");
  const user = useSelector((state) => state.user.userDetails);

  return (
    <div>
      {isAuthenticated && user.role === "student" && <StudentsHome />}
      {isAuthenticated && user.role === "teacher" && <StudentsHome />}
      {!isAuthenticated && <HomeContent />}
    </div>
  );
}
export default Home;
