import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../LoginRegister/userService";
import { toast } from "react-toastify";
import { logout } from "../../LoginRegister/userSlice";

function AuthorizedNavBar() {
  const userInfo = useSelector((state) => state.user.userDetails);
  const userId = userInfo._id;
  const dispatch = useDispatch();
  const userClass = useSelector((state) => state.class.class);
  const classes = !userClass ? [] : userClass.length === 0;
  const navigate = useNavigate();
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
    <ul className="flex justify-around p-4 text-blue-600 font-semibold bg-slate-300">
      {userInfo.role === "student" && !classes ? (
        <>
          <li>
            <Link
              to="/"
              className="hover:text-blue-800 transition duration-300"
            >
              Home
            </Link>
          </li>
     
          <li
            onClick={() => navigate(`/qna/${userId}`)}
            className="hover:text-blue-800 transition duration-300 cursor-pointer"
          >
            QnA
          </li>
          <li>
            <Link
               to={`/playground/${userId}`}
              className="hover:text-blue-800 transition duration-300"
            >
              Playground
            </Link>
          </li>
   
        </>
      ) : (
        userInfo.role === "student" &&
        classes && (
          <li>
            <Link
              to="/"
              className="hover:text-blue-800 transition duration-300"
            >
              Home
            </Link>
          </li>
        )
      )}
      {/* Common links for all users */}
      {userInfo.role === "teacher" && userInfo.approved ? (
        <>
          <li>
            <Link
              to="/classes"
              className="hover:text-blue-800 transition duration-300"
            >
              Home
            </Link>
          </li>{" "}
          <li
            onClick={() => navigate(`/qna/${userId}`)}
            className="hover:text-blue-800 transition duration-300 cursor-pointer"
          >
            QnA
          </li>
          <li
            onClick={() => navigate(`/playground/${userId}`)}
            className="hover:text-blue-800 transition duration-300 cursor-pointer"
          >
            Playground
          </li>
        </>
      ) : (
        userInfo.role === "teacher" &&
        !userInfo.approved && (
          <li>
            <Link
              to="/classes"
              className="hover:text-blue-800 transition duration-300"
            >
              Home
            </Link>
          </li>
        )
      )}
      <li>
        <Link
          to="/profile"
          className="hover:text-blue-800 transition duration-300"
        >
          Profile
        </Link>
      </li>

      <li>
        <Link
          onClick={handleLogout}
          className="hover:text-blue-800 transition duration-300"
        >
          Logout
        </Link>
      </li>

      {/* Conditional links for students */}

      {/* Conditional links for teachers */}
    </ul>
  );
}

export default AuthorizedNavBar;
