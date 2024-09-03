import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../LoginRegister/userService";
import { toast } from "react-toastify";
import { logout } from "../../LoginRegister/userSlice";

function ClassNavBar() {
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
      toast.success("Logout Successfully");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <ul className=" py-4 px-10 text-blue-600 font-semibold bg-slate-300 ">
     <li>
        <Link to="/" className="hover:text-blue-800 transition duration-300">
          Back
        </Link>
      </li>
    </ul>
    //   <li
    //     onClick={() => navigate(`/qna/${userId}`)}
    //     className="hover:text-blue-800 transition duration-300 cursor-pointer"
    //   >
    //     QnA
    //   </li>
    //   <li>
    //     <Link
    //        to={`/playground/${userId}`}
    //       className="hover:text-blue-800 transition duration-300"
    //     >
    //       Playground
    //     </Link>
    //   </li>
    //   <li>
    //     <Link
    //       to="/profile"
    //       className="hover:text-blue-800 transition duration-300"
    //     >
    //       Profile
    //     </Link>
    //   </li>
    //   <li>
    //     <Link
    //       onClick={handleLogout}
    //       className="hover:text-blue-800 transition duration-300"
    //     >
    //       Logout
    //     </Link>
    //   </li>
    //   {userInfo.role === "student" && !classes && <></>}
    //   {userInfo.role === "teacher" && (
    //     <>
    //       <li>
    //         <Link
    //           to="/manage-students"
    //           className="hover:text-blue-800 transition duration-300"
    //         >
    //           Manage Students
    //         </Link>
    //       </li>
    //       <li>
    //         <Link
    //           to="/course-material"
    //           className="hover:text-blue-800 transition duration-300"
    //         >
    //           Course Material
    //         </Link>
    //       </li>
    //     </>
    //   )}
    // </ul>
  );
}

export default ClassNavBar;
