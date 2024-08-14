import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

function AuthorizedNavBar() {
  const userId = useSelector((state) => state.user.userDetails._id);
  const userInfo = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate();

  return (
    <ul className="flex justify-around p-4 text-blue-600 font-semibold">
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
      <li>
        <Link
          to="/dashboard"
          className="hover:text-blue-800 transition duration-300"
        >
          Dashboard
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
      <li>
        <Link
          to="/logout"
          className="hover:text-blue-800 transition duration-300"
        >
          Logout
        </Link>
      </li>
    </ul>
  );
}

export default AuthorizedNavBar;
