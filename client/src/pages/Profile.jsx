import { useSelector } from "react-redux";
import Home from "../ui/Home";
import { useNavigate } from "react-router";
import StudentProfilePage from "../ui/Students UI/StudentProfilePage";
import TeacherProfilePage from "../ui/Teacher UI/TeacherProfilePage";

function Profile() {
  const navigate = useNavigate();
  const userType = useSelector((state) => state.user.userDetails.role);

  return (
    <>
      {!userType && navigate("/")}
      {userType === "student" && <StudentProfilePage />}
      {userType === "teacher" && <TeacherProfilePage />}
    </>
  );
}
export default Profile;
