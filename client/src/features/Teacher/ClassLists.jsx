import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  useFetchClassByIdMutation,
  useFetchClassMutation,
} from "./classService";
import { setClass } from "./classSlice";

const ClassLists = () => {
  const userInfo = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Initialize the fetchClassById mutation
  const [fetchClassById, { data: classes, isLoading, error }] =
    useFetchClassMutation();

  useEffect(() => {
    const fetchClasses = async () => {
      if (userInfo && userInfo.role === "teacher") {
        try {
          const data = await fetchClassById(userInfo._id); // Fetch classes for the teacher
          dispatch(setClass(data.data));
        } catch (error) {
          console.error("Error fetching classes:", error);
        }
      }
    };

    fetchClasses(); // Call the async function
  }, [fetchClassById, userInfo, dispatch]);
  if (!userInfo || userInfo.role !== "teacher") {
    return (
      <div className="text-center text-red-600 mt-10">
        You do not have permission to view this page.
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center text-gray-600 mt-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-10">
        Error loading classes.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Classes</h1>
      {classes && classes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Link to={`/${classItem._id}/class`} key={classItem._id}>
              <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-700">
                  {classItem.className}
                </h2>
                <p className="text-sm text-gray-500">
                  Invite Code: {classItem.inviteCode}
                </p>
                <p className="text-sm text-gray-500">
                  Students: {classItem.students.length}
                </p>
              </div>
            </Link>
          ))}
          {/* Add New Class Card */}
          <div
            onClick={() => navigate("/create-class")}
            className="flex items-center justify-center bg-white shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            <div className="text-center">
              <p className="text-5xl text-gray-400 font-bold">+</p>
              <p className="text-lg text-gray-600 mt-2">Add New Class</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">You have not created any classes yet.</p>
      )}
    </div>
  );
};

export default ClassLists;
