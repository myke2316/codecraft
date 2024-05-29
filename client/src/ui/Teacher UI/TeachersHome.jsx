import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useLogoutMutation } from "../../features/LoginRegister/userService";
import { logout } from "../../features/LoginRegister/userSlice";
import ClassList from "../../features/Teacher/ClassList";

function TeachersHome() {
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
      <div className="text-white grid grid-cols-5 gap-2 w-100%">
        <ClassList />
      </div>
      <button
        className="flex gap-3 text-white"
        onClick={() => navigate("/create-class")}
      >
        + Create Class
      </button>{" "}
      <button className="p-3 bg-slate-50 mt-2" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
export default TeachersHome;
