import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateUserProgressMutation,
  useFetchUserProgressMutation,
} from "../Student/studentCourseProgressService";
import { setUserProgress } from "../Student/studentCourseProgressSlice";

import { toast } from "react-toastify";
import { useFetchClassByIdMutation } from "../Teacher/classService";
import { useGetAllUserMutation } from "../LoginRegister/userService";
import { useGetAllAnalyticsMutation } from "../Student/userAnalyticsService";
import { updateClass } from "../Teacher/classSlice";
import ClassOverview from "../Teacher/ClassOverview";
import LeaderboardStudents from "../Teacher/LeaderboardStudents";

function ClassStudentHome() {
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
  const [createUserProgress, { isLoading }] = useCreateUserProgressMutation();
  const [fetchUserProgress, { isLoading: isLoadingFetch }] =
    useFetchUserProgressMutation();
  const user = useSelector((state) => state.user.userDetails);
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

        const studentDetails = classResponse.students
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

  async function handleOnClick() {
    try {
      const existingProgress = await fetchUserProgress({
        userId: user._id,
      }).unwrap();

      if (!existingProgress) {
        await createUserProgress({
          userId: user._id,
        }).unwrap();
        dispatch(setUserProgress(createUserProgress));
      } else {
        navigate("/course");
      }
    } catch (error) {
      console.error("Error:", error);

      toast.error(error.message || error.data);
    }
  }

  if (loading)
    return <div className="text-center text-gray-600 mt-10">Loading...</div>;
  if (error)
    return <div className="text-center text-red-600 mt-10">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-white">
        {selectedClass.className}
      </h1>
      <p className="text-lg text-white mb-6">
        Invite Code:{" "}
        <span className="font-semibold">{selectedClass.inviteCode}</span>
      </p>{" "}
      <button
        onClick={handleOnClick}
        className="mb-5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Course Now!
      </button>
      {/* Overall Class Progress */}
      <ClassOverview
        averagePoints={averagePoints}
        averageTimeSpent={averageTimeSpent}
        students={students}
      />
      {/* Leaderboard Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Students</h2>
        <LeaderboardStudents students={students} classId={classId} />
      </div>
    </div>
  );
}
export default ClassStudentHome;
