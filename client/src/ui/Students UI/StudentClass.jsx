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

  function redirectStudent() {
    navigate(`/studentClass/${userClass._id}`);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      
    >
      {!classes ? (
        <div className="max-w-lg w-full p-6 rounded-2xl  space-y-4" >
          <StudentClassContainer />
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full text-center space-y-6" >
          <h2 className="text-2xl font-bold text-gray-800">No Classes Available</h2>
          <p className="text-gray-500">
            You haven't joined any classes yet. Join a class to get started.
          </p>
          <JoinClassForm />
        </div>
      )}
    </div>
  );
}

export default StudentClass;
