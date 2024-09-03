import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCreateUserProgressMutation,
  useFetchUserProgressMutation,
} from "../Student/studentCourseProgressService";
import {
  resetProgress,
  setUserProgress,
} from "../Student/studentCourseProgressSlice";

import { toast } from "react-toastify";
import {
  useFetchClassByIdMutation,
  useRemoveStudentMutation,
} from "../Teacher/classService";
import {
  useGetAllUserMutation,
  useLogoutMutation,
} from "../LoginRegister/userService";
import { useGetAllAnalyticsMutation } from "../Student/userAnalyticsService";
import {
  leaveClass,
  updateClass,
  updateClassStudent,
} from "../Teacher/classSlice";
import ClassOverview from "../Teacher/ClassOverview";
import LeaderboardStudents from "../Teacher/LeaderboardStudents";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { resetAnalytics } from "../Student/userAnalyticsSlice";
import { resetActivity } from "../Course/CodingActivity/activitySubmissionSlice";
import { resetQuiz } from "../Course/Quiz/quizSubmissionSlice";

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

        dispatch(updateClassStudent(classResponse));

        const [userResponse, analyticsResponse] = await Promise.all([
          getAllUsers().unwrap(),
          getAllAnalytics().unwrap(),
        ]);

        const analyticsArray = Array.isArray(analyticsResponse)
          ? analyticsResponse
          : Object.values(analyticsResponse); // Convert object to array
        console.log(analyticsArray);
        const studentDetails = classResponse.students
          .map((studentId) => {
            const student = userResponse.find((user) => user._id === studentId);
            if (student) {
              const analytics = analyticsArray.find(
                (analytic) => analytic.userId === studentId
              );

              const totalPoints =
                analytics && analytics.coursesAnalytics
                  ? analytics.coursesAnalytics.reduce(
                      (total, course) => total + course.totalPointsEarned,
                      0
                    )
                  : 0;
              console.log(totalPoints);
              const totalTimeSpent =
                analytics && analytics.coursesAnalytics
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
  const userProgress = useSelector(
    (state) => state.studentProgress.userProgress
  );
  //HANDLE START COURSE
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
        if (userProgress && userProgress.coursesProgress.length > 0) {
          // Find the latest course progress
          const latestCourse = userProgress.coursesProgress.find(
            (course) => !course.locked && !course.dateFinished
          );
    
          // Ensure the user has progress in a course
          if (latestCourse) {
            // Find the latest lesson within the course
            const latestLesson = latestCourse.lessonsProgress.find(
              (lesson) => !lesson.locked && !lesson.dateFinished
            );
    
            // Ensure the user has progress in a lesson
            if (latestLesson) {
              // Redirect to the latest lesson using navigate
              navigate(`/course/${latestCourse.courseId}/lesson/${latestLesson.lessonId}`);
            } else {
              // If no latest lesson found, navigate to the course overview
              navigate(`/course/${latestCourse.courseId}`);
            }
          } else {
            // If no course found, navigate to the course overview page
            navigate("/course");
          }
        } else {
          // If no user progress exists, create a new progress entry
          await createUserProgress({ userId: user._id }).unwrap();
          dispatch(setUserProgress(createUserProgress));
          navigate("/course");
        }
      }
    } catch (error) {
      console.error("Error:", error);

      toast.error(error.message || error.data);
    }
  }

  //HANDLE LEAVE CLASS
  const [openDialog, setOpenDialog] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [removeStudent] = useRemoveStudentMutation();

  async function handleLeaveClass(studentToRemove) {
    try {
      const data = await removeStudent({
        classId,
        studentId: studentToRemove,
      }).unwrap();
      console.log(data);
      setStudents(
        students.filter((student) => student._id !== studentToRemove)
      );
      dispatch(updateClassStudent(data.data));

      dispatch(resetQuiz());
      dispatch(resetAnalytics());
      dispatch(resetProgress());
      dispatch(resetActivity());
      dispatch(leaveClass());
      toast.success("Leaved class successfully!");
      navigate("/");
      setOpenDialog(false); // Close the dialog
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove student.");
    }
  }

  const handleOpenDialog = (studentId) => {
    setStudentToRemove(studentId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setStudentToRemove(null);
  };

  if (loading)
    return <div className="text-center text-gray-600 mt-10">Loading...</div>;
  if (error)
    return <div className="text-center text-red-600 mt-10">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-black">
        {selectedClass.className}
      </h1>
      <p className="text-lg text-black mb-6">
        Invite Code:{" "}
        <span className="font-semibold">{selectedClass.inviteCode}</span>
      </p>{" "}
      <div className="flex space-x-4 mt-6">
        <button
          onClick={handleOnClick}
          className="mb-5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start Course Now!
        </button>
        <button
          onClick={handleOpenDialog}
          className="mb-5 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Leave Class
        </button>
      </div>
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
      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to leave class. Any progress won't be saved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleLeaveClass(user._id)}
            color="secondary"
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
export default ClassStudentHome;
