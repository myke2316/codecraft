import { useSelector } from "react-redux";
import StudentsHome from "../../ui/Students UI/StudentsHome";
import TeachersHome from "../../ui/Teacher UI/TeachersHome";

function AuthorizedHome() {
  const isAuthenticated = localStorage.getItem("userDetails");
  const user = useSelector((state) => state.user.userDetails);
  return (
    <div>
      {" "}
      {isAuthenticated && user.role === "student" && <StudentsHome />}
      {isAuthenticated && user.role === "teacher" && <TeachersHome />}
    </div>
  );
}
export default AuthorizedHome;
