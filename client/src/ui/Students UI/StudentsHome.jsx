import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useLogoutMutation } from "../../features/LoginRegister/userService";
import { logout } from "../../features/LoginRegister/userSlice";
import StudentClass from "./StudentClass";

function StudentsHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userClass = useSelector((state) => state.user.userDetails);

  // const [logoutApi] = useLogoutMutation();

  // async function handleLogout() {
  //   try {
  //     await logoutApi().unwrap();
  //     dispatch(logout());
  //     // window.location.href = `${BACKEND_URL}/auth/logoutGoogle`;
  //     console.log("LOGOUT SUCCESS");
  //     toast.success("Logout Successfully");
  //     navigate("/login");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  return (
    <div className="text-white">
      <StudentClass />

      {/* <button
        className="text-black p-3 bg-slate-50 mt-2"
        onClick={handleLogout}
      >
        Logout
      </button> */}
    </div>
  );
}
export default StudentsHome;
