import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import ClassOverview from '../Teacher/ClassOverview';
import LeaderboardStudents from '../Teacher/LeaderboardStudents';
import { useCreateUserProgressMutation, useFetchUserProgressMutation } from '../Student/studentCourseProgressService';
import { useFetchClassByIdMutation, useRemoveStudentMutation } from '../Teacher/classService';
import { useGetAllUserMutation } from '../LoginRegister/userService';
import { useGetAllAnalyticsMutation } from '../Student/userAnalyticsService';
import { leaveClass, updateClassStudent } from '../Teacher/classSlice';
import { resetAnalytics } from '../Student/userAnalyticsSlice';
import { resetActivity } from '../Course/CodingActivity/activitySubmissionSlice';
import { resetQuiz } from '../Course/Quiz/quizSubmissionSlice';
import { resetProgress, setUserProgress } from '../Student/studentCourseProgressSlice';

export default function ClassStudentHome() {
  const dispatch = useDispatch();
  const { classId } = useParams();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.user.userDetails);
  const userProgress = useSelector((state) => state.studentProgress.userProgress);

  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averagePoints, setAveragePoints] = useState(0);
  const [averageTimeSpent, setAverageTimeSpent] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [confirmationText, setConfirmationText] = useState('');

  const [getAllUsers] = useGetAllUserMutation();
  const [fetchClass] = useFetchClassByIdMutation();
  const [getAllAnalytics] = useGetAllAnalyticsMutation();
  const [createUserProgress] = useCreateUserProgressMutation();
  const [fetchUserProgress] = useFetchUserProgressMutation();
  const [removeStudent] = useRemoveStudentMutation();

  const fetchUsersAndAnalytics = useCallback(async () => {
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
        : Object.values(analyticsResponse);

      const studentDetails = classResponse.students
        .map((studentId) => {
          const student = userResponse.find((user) => user._id === studentId);
          if (student) {
            const analytics = analyticsArray.find(
              (analytic) => analytic.userId === studentId
            );
            const totalPoints = analytics?.coursesAnalytics?.reduce(
              (total, course) => total + course.totalPointsEarned,
              0
            ) || 0;
            const totalTimeSpent = analytics?.coursesAnalytics?.reduce(
              (total, course) => total + course.totalTimeSpent,
              0
            ) || 0;

            return {
              ...student,
              totalPointsEarned: totalPoints,
              totalTimeSpent: totalTimeSpent,
              badges: analytics?.badges || [],
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
      console.error(err);
      setError('Error loading students or analytics.');
    } finally {
      setLoading(false);
    }
  }, [classId, getAllUsers, getAllAnalytics, fetchClass, dispatch]);

  useEffect(() => {
    fetchUsersAndAnalytics();
  }, [fetchUsersAndAnalytics]);

  const handleOnClick = useCallback(async () => {
    try {
      const existingProgress = await fetchUserProgress({
        userId: userInfo._id,
      }).unwrap();

      if (!existingProgress) {
        const newProgress = await createUserProgress({
          userId: userInfo._id,
        }).unwrap();
        dispatch(setUserProgress(newProgress));
        navigate('/course');
      } else {
        if (userProgress && userProgress.coursesProgress.length > 0) {
          const latestCourse = userProgress.coursesProgress.find(
            (course) => !course.locked && !course.dateFinished
          );

          if (latestCourse) {
            const latestLesson = latestCourse.lessonsProgress.find(
              (lesson) => !lesson.locked && !lesson.dateFinished
            );

            if (latestLesson) {
              navigate(
                `/course/${latestCourse.courseId}/lesson/${latestLesson.lessonId}`
              );
            } else {
              navigate(`/course/${latestCourse.courseId}`);
            }
          } else {
            navigate('/course');
          }
        } else {
          const newProgress = await createUserProgress({ userId: userInfo._id }).unwrap();
          dispatch(setUserProgress(newProgress));
          navigate('/course');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || error.data);
    }
  }, [userInfo._id, fetchUserProgress, createUserProgress, userProgress, navigate, dispatch]);

  const handleLeaveClass = useCallback(async () => {
    if (confirmationText === 'REMOVESTUDENT123') {
      try {
        const data = await removeStudent({
          classId,
          studentId: userInfo._id,
        }).unwrap();
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student._id !== userInfo._id)
        );
        dispatch(updateClassStudent(data.data));
        dispatch(resetQuiz());
        dispatch(resetAnalytics());
        dispatch(resetProgress());
        dispatch(resetActivity());
        dispatch(leaveClass());
        toast.success('Left class successfully!');
        navigate('/');
        setOpenDialog(false);
      } catch (error) {
        console.error(error);
        toast.error('Failed to remove student.');
      }
    } else {
      toast.error('Incorrect confirmation text. Please try again.');
    }
  }, [confirmationText, removeStudent, classId, userInfo._id, dispatch, navigate]);

  const handleOpenDialog = useCallback(() => {
    setOpenDialog(true);
    setConfirmationStep(1);
    setConfirmationText('');
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setConfirmationStep(1);
    setConfirmationText('');
  }, []);

  const handleNextStep = useCallback(() => {
    setConfirmationStep(2);
  }, []);

  const handleConfirmationTextChange = useCallback((event) => {
    setConfirmationText(event.target.value);
  }, []);

  if (loading) return <div className="text-center text-gray-600 mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;

  return (
    <div className="p-0 max-w-7xl mx-auto">
      <ClassOverview
        averagePoints={averagePoints}
        averageTimeSpent={averageTimeSpent}
        students={students}
        handleOnClick={handleOnClick}
        handleOpenDialog={handleOpenDialog}
      />

      <LeaderboardStudents students={students} classId={classId} />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {confirmationStep === 1 ? 'Confirm Removal' : 'Final Confirmation'}
        </DialogTitle>
        <DialogContent>
          {confirmationStep === 1 ? (
            <Typography variant="body1">
              Are you sure you want to leave the class? Any progress won't be saved.
            </Typography>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                To confirm leaving the class, please type "REMOVESTUDENT123" below:
              </Typography>
              <Alert severity="warning">Leaving the class will log you out</Alert>
              <TextField
                autoFocus
                margin="dense"
                fullWidth
                value={confirmationText}
                onChange={handleConfirmationTextChange}
                variant="outlined"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          {confirmationStep === 1 ? (
            <Button onClick={handleNextStep} color="secondary" variant="contained">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleLeaveClass}
              color="secondary"
              variant="contained"
              disabled={confirmationText !== 'REMOVESTUDENT123'}
            >
              Leave Class
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}