import { Outlet, useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";

function CourseLayout() {
  const navigate = useNavigate();
  return (
    <div>
      <div
        className="bg-gray-800 p-4 flex justify-between"
        onClick={() => navigate("/")}
      >
        <div className="text-white hover:text-gray-200 flex">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <button type="button">Back</button>
        </div>
      </div>
      <div>
        <Outlet />
        <ToastContainer />
      </div>
    </div>
  );
}
export default CourseLayout;
