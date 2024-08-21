import { useSelector } from "react-redux";
import StudentsHome from "../../ui/Students UI/StudentsHome";
import TeachersHome from "../../ui/Teacher UI/TeachersHome";
import AdminsHome from "../Admin/AdminsHome";
import AdminLayout from "../Admin/AdminLayout";
import { useNavigate } from "react-router";

function AuthorizedHome() {
  const isAuthenticated = localStorage.getItem("userDetails");
  const user = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate()
  return (
    <div>
      {" "}
      {isAuthenticated && user.role === "student" && <StudentsHome />}
      {isAuthenticated && user.role === "teacher" && <TeachersHome />}
      {isAuthenticated && user.role === "admin" && navigate("/admin-dashboard")}
    </div>
  );
}
export default AuthorizedHome;
