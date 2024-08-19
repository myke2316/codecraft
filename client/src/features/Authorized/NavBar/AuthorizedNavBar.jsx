import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

function AuthorizedNavBar() {
  const userInfo = useSelector((state) => state.user.userDetails);
  const userId = userInfo._id;
  const navigate = useNavigate();

  return (
    <ul className="flex justify-around p-4 text-blue-600 font-semibold">
      {/* Common links for all users */}
      <li>
        <Link to="/" className="hover:text-blue-800 transition duration-300">
          Home
        </Link>
      </li>
      <li>
        <Link
          to="/profile"
          className="hover:text-blue-800 transition duration-300"
        >
          Profile
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
          to="/logout"
          className="hover:text-blue-800 transition duration-300"
        >
          Logout
        </Link>
      </li>

      {/* Conditional links for students */}
      {userInfo.role === "student" && (
        <>
          <li>
            <Link
              to="/dashboard"
              className="hover:text-blue-800 transition duration-300"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/playground"
              className="hover:text-blue-800 transition duration-300"
            >
              Playground
            </Link>
          </li>
          <li>
            <Link
              to="/course"
              className="hover:text-blue-800 transition duration-300"
            >
              Course
            </Link>
          </li>
        </>
      )}

      {/* Conditional links for teachers */}
      {userInfo.role === "teacher" && (
        <>
  
          <li>
            <Link
              to="/classes"
              className="hover:text-blue-800 transition duration-300"
            >
              Class
            </Link>
          </li>
      
        </>
      )}
    </ul>
  );
}

export default AuthorizedNavBar;
