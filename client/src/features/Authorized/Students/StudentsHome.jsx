import { useDispatch, useSelector } from "react-redux";
import MiscBarStudents from "./MiscBarStudents";
import NavBarStudents from "./NavBarStudents";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useLogoutMutation } from "../../LoginRegister/userService";
import { logout } from "../../LoginRegister/userSlice";
import { BACKEND_URL } from "../../../constants";

function StudentsHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.userDetails);
  const [logoutApi] = useLogoutMutation();
  async function handleLogout() {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      // window.location.href = `${BACKEND_URL}/auth/logoutGoogle`;
      console.log("LOGOUT SUCCESS");
      toast.success("Logout Successfully");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <div>
        <nav>
          {/* <NavBarStudents /> */}
          {/* <MiscBarStudents /> */}
        </nav>
      </div>
      This is {"<StudentsHome />"}
      <div className="text-white">
        <img alt="profilepicture" src={user.picture} />
        <h1>ID: {user._id}</h1>
        <h1>Username: {user.username || user.given_name}</h1>
        <h1>Email: {user.email}</h1>
        <h1>Role: {user.role}</h1>
      </div>
      <button className="p-3 bg-slate-50 mt-2" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
export default StudentsHome;
