import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetAllUserMutation } from "../LoginRegister/userService";

import Leaderboard from "./LeaderboardStudents";
import { useGetAllAnalyticsMutation } from "../Student/userAnalyticsService";
import { formatTime } from "../../utils/formatTime";
import ClassOverview from "./ClassOverview";
import { useFetchClassByIdMutation } from "./classService";
import { updateClass } from "./classSlice";

function TeacherClassHome() {
  const dispatch = useDispatch();
  const { classId } = useParams();
  const classes = useSelector((state) => state.class.class);
  const userInfo = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate();
  // State for storing users and analytics
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averagePoints, setAveragePoints] = useState(0);
  const [averageTimeSpent, setAverageTimeSpent] = useState(0);
  // Initialize mutations
  const [getAllUsers] = useGetAllUserMutation();
  const [fetchClass] = useFetchClassByIdMutation();
  const [getAllAnalytics] = useGetAllAnalyticsMutation();

  useEffect(() => {
    const fetchUsersAndAnalytics = async () => {
      try {
        const classResponse = await fetchClass(classId).unwrap();
        setSelectedClass(classResponse);
        console.log(classResponse);
        dispatch(updateClass({ classId, updatedClass: classResponse }));

        const [userResponse, analyticsResponse] = await Promise.all([
          getAllUsers().unwrap(),
          getAllAnalytics().unwrap(),
        ]);

        const studentDetails = (classResponse.students || [])
          .map((studentId) => {
            const student = userResponse.find((user) => user._id === studentId);
            if (student) {
              const analytics = analyticsResponse.find(
                (analytic) => analytic.userId === studentId
              );
              const totalPoints = analytics
                ? analytics.coursesAnalytics.reduce(
                    (total, course) => total + course.totalPointsEarned,
                    0
                  )
                : 0;

              const totalTimeSpent = analytics
                ? analytics.coursesAnalytics.reduce(
                    (total, course) => total + course.totalTimeSpent,
                    0
                  )
                : 0;

              return {
                ...student,
                totalPointsEarned: totalPoints,
                totalTimeSpent: totalTimeSpent,
                badges: analytics ? analytics.badges : [],
              };
            }
            return null;
          })
          .filter(Boolean);

        setStudents(studentDetails);

        const totalPoints = studentDetails.reduce(
          (sum, student) => sum + student.totalPointsEarned,
          0
        );
        const totalTime = studentDetails.reduce(
          (sum, student) => sum + student.totalTimeSpent,
          0
        );

        setAveragePoints(totalPoints / studentDetails.length || 0);
        setAverageTimeSpent(totalTime / studentDetails.length || 0);
      } catch (err) {
        console.log(err);
        setError("Error loading students or analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndAnalytics();
  }, [classId, getAllUsers, getAllAnalytics]);
  if (!userInfo || userInfo.role !== "teacher") {
    return (
      <div className="text-center text-red-600 mt-10">
        You do not have permission to view this page.
      </div>
    );
  }

  console.log(students, averagePoints, averageTimeSpent);
  if (loading)
    return <div className="text-center text-gray-600 mt-10">Loading...</div>;
  // if (error)
  //   return <div className="text-center text-red-600 mt-10">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        {selectedClass.className}
      </h1>
      <button
        onClick={() => navigate(`class-edit`)}
        className="text-blue-500 hover:text-blue-700 font-semibold"
      >
        Edit Class
      </button>
      <p className="text-lg text-gray-600 mb-6">
        Invite Code:{" "}
        <span className="font-semibold">{selectedClass.inviteCode}</span>
      </p>
      {/* Overall Class Progress */}
      <ClassOverview
        averagePoints={averagePoints}
        averageTimeSpent={averageTimeSpent}
        students={students}
      />

      {/* Leaderboard Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Students</h2>
        <Leaderboard students={students} classId={classId} />
      </div>
    </div>
  );
}

export default TeacherClassHome;
