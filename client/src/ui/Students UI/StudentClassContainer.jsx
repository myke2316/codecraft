import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

function StudentClassContainer() {
  const navigate = useNavigate();

  const userClass = useSelector((state) => state.class.class);

  function handleClick() {
    navigate(`/studentClass/${userClass[0]._id}`);
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
