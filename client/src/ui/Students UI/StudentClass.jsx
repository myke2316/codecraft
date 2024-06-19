import { useNavigate } from "react-router";
import StudentClassContainer from "./StudentClassContainer";
import { useSelector } from "react-redux";

function StudentClass() {
  const navigate = useNavigate();
  const userClass = useSelector((state) => state.class.class);
  const classes = !userClass ? [] :userClass.length === 0;
  return (
    <div className="text-white">
      {!classes && <StudentClassContainer />}
      {classes && (
        <>
          <h1>No Class Yet: </h1>
          <button
            onClick={() => {
              navigate("/join-class");
            }}
          >
            + Join a Class
          </button>
        </>
      )}
    </div>
  );
}
export default StudentClass;
