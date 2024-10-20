import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import JoinClassForm from "../../features/Student/JoinClassForm";
import StudentClassContainer from "./StudentClassContainer";

function StudentClass() {
  const [open, setOpen] = useState(false);
  const userClass = useSelector((state) => state.class.class);
  const classes = !userClass ? [] : userClass.length === 0;
  const navigate = useNavigate();
  const hasClasses = Array.isArray(userClass) && userClass.length > 0;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function redirectStudent() {
    navigate(`/studentClass/${userClass._id}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full">
        {!classes ? (
          <StudentClassContainer />
        ) : (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              No Classes Available
            </h2>
            <p className="text-gray-500">
              You haven't joined any classes yet. Join a class to get started.
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-5 rounded-full shadow-md transition-transform transform hover:scale-105"
              onClick={handleOpen}
            >
              + Join a Class
            </button>

            {/* Dialog for JoinClassForm */}
            {open && (
              <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 transition-transform transform duration-300 scale-100">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Join a Class
                  </h3>
                  <JoinClassForm />
                  <div className="flex justify-end">
                    <button
                      onClick={handleClose}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentClass;
