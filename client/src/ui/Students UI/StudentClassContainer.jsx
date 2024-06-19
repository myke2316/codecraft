import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

function StudentClassContainer() {
  const navigate = useNavigate();

  const userClass = useSelector((state) => state.class.class);
  const classId = userClass[0]?._id || userClass?._id
  function handleClick() {
    navigate(`/studentClass/${classId}`);
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className="cursor-pointer text-black p-4 bg-white border rounded shadow w-auto"
      >
        {userClass[0]?.className || userClass?.className}
      </div>
    </div>
  );
}
export default StudentClassContainer;
