import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Alert,
} from "@mui/material";
import TeacherCourseCompletionChart from "./ClassDashboard/TeacherCourseCompletionChart";
import { useFetchAllClassesMutation } from "./classService";
import {
  useAggregateAllAnalyticsMutation,
  useGetAllAnalyticsMutation,
} from "../Student/userAnalyticsService";
import { useGetAllProgressMutation } from "../Student/studentCourseProgressService";
import { useGetAllUserMutation } from "../LoginRegister/userService";
import CourseActiveChart from "../Admin/pages/AdminDashboardFiles/CourseActiveChart";
import TeacherCourseActiveChart from "./ClassDashboard/TeacherCourseActiveChart";
import ClassesOverview from "./ClassDashboard/ClassesOverview";
import StudentTable from "./ClassDashboard/StudentTable";
import TopThreeLeaderboard from "./ClassDashboard/TopThreeLeaderboard";
import SchoolIcon from "@mui/icons-material/School";
import AverageMetricsChart from "./ClassDashboard/AverageMetricsChart";
const ClassesDashboard = () => {
  const classesData = useSelector((state) => state.class.class);
  console.log(classesData);
  const [userAnalytics, setUserAnalytics] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("all");
  const [userAllAnalytics, setUserAllAnalytics] = useState([]);
  const [getEveryAnalytics] = useGetAllAnalyticsMutation();
  const [fetchClass] = useFetchAllClassesMutation();
  const [getAllAnalytics] = useAggregateAllAnalyticsMutation();
  const [getAllProgress] = useGetAllProgressMutation();
  const [getAllUser] = useGetAllUserMutation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const analyticsResponse = await getAllAnalytics();
        setUserAnalytics(analyticsResponse.data);

        const progressResponse = await getAllProgress();
        setUserProgress(progressResponse.data);

        const allAnalyticsResponse = await getEveryAnalytics();
        setUserAllAnalytics(allAnalyticsResponse.data);

        const usersResponse = await getAllUser();
        setUsers(usersResponse.data);

        console.log("ANALYTICS:", analyticsResponse.data);
        console.log("PROGRESS:", progressResponse.data);
        console.log("USERS:", usersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchClass, getAllAnalytics, getAllProgress, getAllUser]);

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const filteredClassesData =
    selectedClass === "all"
      ? classesData
      : classesData.filter((classItem) => classItem._id === selectedClass);

  const filteredUserProgress =
    selectedClass === "all"
      ? userProgress
      : userProgress.filter((progress) => {
          const classStudents =
            classesData.find((c) => c._id === selectedClass)?.students || [];
          return classStudents.includes(progress.userId);
        });
  const allTeacherStudents = useMemo(() => {
    const studentIds = new Set();
    classesData.forEach((classItem) => {
      classItem.students.forEach((studentId) => studentIds.add(studentId));
    });
    return Array.from(studentIds);
  }, [classesData]);

  const filteredStudents = useMemo(() => {
    if (selectedClass === "all") {
      return users.filter((user) => allTeacherStudents.includes(user._id));
    } else {
      const selectedClassData = classesData.find(
        (c) => c._id === selectedClass
      );
      return users.filter((user) =>
        selectedClassData.students.includes(user._id)
      );
    }
  }, [selectedClass, classesData, users, allTeacherStudents]);
  //active users per course
  const activeUsersPerCourse = useMemo(() => {
    if (!users || !userProgress || !classesData) {
      return [];
    }
  
    const relevantStudents = new Set(
      selectedClass === "all"
        ? classesData.flatMap((classItem) => classItem.students.map(String))
        : classesData
            .find((classItem) => classItem._id === selectedClass)
            ?.students.map(String) || []
    );
  
    const courseActiveUsersMap = {};
    const userLatestActivity = {};
  
    const isCourseCompleted = (courseProgress) => {
      return courseProgress.courseCompleted || courseProgress.lessonsProgress.every(lesson => 
        lesson.dateFinished &&
        lesson.documentsProgress.every(doc => doc.dateFinished) &&
        lesson.quizzesProgress.every(quiz => quiz.dateFinished) &&
        lesson.activitiesProgress.every(activity => activity.dateFinished)
      );
    };
  
    users.forEach((user) => {
      if (relevantStudents.has(user._id.toString())) {
        const userProgressEntry = userProgress.find(
          (up) => up.userId.toString() === user._id.toString()
        );
  
        if (userProgressEntry) {
          let latestDate = null;
          let latestCourseId = null;
  
          userProgressEntry.coursesProgress.forEach((courseProgress) => {
            const courseId = courseProgress.courseId.toString();
  
            if (!courseActiveUsersMap[courseId]) {
              courseActiveUsersMap[courseId] = new Set();
            }
  
            if (isCourseCompleted(courseProgress)) {
              return;
            }
  
            const checkAndUpdateLatest = (date) => {
              if (date && (!latestDate || new Date(date) > latestDate)) {
                latestDate = new Date(date);
                latestCourseId = courseId;
              }
            };
  
            checkAndUpdateLatest(courseProgress.dateFinished);
  
            courseProgress.lessonsProgress.forEach((lesson) => {
              checkAndUpdateLatest(lesson.dateFinished);
  
              lesson.documentsProgress.forEach((document) => {
                checkAndUpdateLatest(document.dateFinished);
              });
  
              lesson.quizzesProgress.forEach((quiz) => {
                checkAndUpdateLatest(quiz.dateFinished);
              });
  
              lesson.activitiesProgress.forEach((activity) => {
                checkAndUpdateLatest(activity.dateFinished);
              });
            });
          });
  
          if (latestCourseId) {
            userLatestActivity[user._id.toString()] = {
              courseId: latestCourseId,
              date: latestDate,
            };
          }
        }
      }
    });
  
    Object.entries(userLatestActivity).forEach(([userId, { courseId }]) => {
      const userProgressEntry = userProgress.find(up => up.userId.toString() === userId);
      const courseProgress = userProgressEntry.coursesProgress.find(cp => cp.courseId.toString() === courseId);
      
      if (!isCourseCompleted(courseProgress)) {
        Object.keys(courseActiveUsersMap).forEach((cId) => {
          if (cId !== courseId) {
            courseActiveUsersMap[cId].delete(userId);
          }
        });
        courseActiveUsersMap[courseId].add(userId);
      }
    });
  
    return Object.keys(courseActiveUsersMap).map((courseId) => ({
      courseId,
      activeUsers: Array.from(courseActiveUsersMap[courseId]),
    }));
  }, [users, userProgress, classesData, selectedClass]);
  //class overview
  const classOverviewData = useMemo(() => {
    if (selectedClass === "all") {
      const allStudents = classesData.flatMap((c) => c.students);
      const allAnalytics = userAnalytics.filter((a) =>
        allStudents.includes(a.userId)
      );

      const totalPoints = allAnalytics.reduce(
        (sum, a) => sum + a.totalPointsEarned,
        0
      );
      const totalTimeSpent = allAnalytics.reduce(
        (sum, a) => sum + a.totalTimeSpent,
        0
      );
      const totalBadges = allAnalytics.reduce((sum, a) => sum + a.badges, 0);

      return {
        averagePoints: totalPoints / allStudents.length || 0,
        averageTimeSpent: totalTimeSpent / allStudents.length || 0,
        averageBadges: totalBadges / allStudents.length || 0,
        students: allStudents,
      };
    } else {
      const selectedClassData = classesData.find(
        (c) => c._id === selectedClass
      );
      if (!selectedClassData)
        return {
          averagePoints: 0,
          averageTimeSpent: 0,
          averageBadges: 0,
          students: [],
        };

      const classAnalytics = userAnalytics.filter((a) =>
        selectedClassData.students.includes(a.userId)
      );

      const totalPoints = classAnalytics.reduce(
        (sum, a) => sum + a.totalPointsEarned,
        0
      );
      const totalTimeSpent = classAnalytics.reduce(
        (sum, a) => sum + a.totalTimeSpent,
        0
      );
      const totalBadges = classAnalytics.reduce((sum, a) => sum + a.badges, 0);

      return {
        averagePoints: totalPoints / selectedClassData.students.length || 0,
        averageTimeSpent:
          totalTimeSpent / selectedClassData.students.length || 0,
        averageBadges: totalBadges / selectedClassData.students.length || 0,
        students: selectedClassData.students,
      };
    }
  }, [selectedClass, classesData, userAnalytics]);

  //average metrics chart
  const relevantStudents = useMemo(() => {
    const studentIds = new Set();
    if (selectedClass === "all") {
      classesData.forEach((classItem) => {
        classItem.students.forEach((studentId) => studentIds.add(studentId));
      });
    } else {
      const selectedClassData = classesData.find(
        (c) => c._id === selectedClass
      );
      if (selectedClassData) {
        selectedClassData.students.forEach((studentId) =>
          studentIds.add(studentId)
        );
      }
    }
    return studentIds;
  }, [classesData, selectedClass]);
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  if (!classesData || classesData.length === 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        height="100%"
        sx={{
          padding: 3,
          backgroundColor: "#f4f6f8",
          borderRadius: 2,
          border: "1px solid #ddd",
        }}
      >
        <SchoolIcon sx={{ fontSize: 50, color: "rgb(110, 97, 171)", mb: 2 }} />
        <Alert severity="warning" sx={{ maxWidth: "400px", width: "100%" }}>
          <Typography variant="h6" gutterBottom>
            No Classes Yet
          </Typography>
          <Typography variant="body2">
            There are currently no classes available. Please check back later or
            add a new class.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Class Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <FormControl fullWidth>
            <InputLabel id="class-select-label">Select Class</InputLabel>
            <Select
              labelId="class-select-label"
              id="class-select"
              value={selectedClass}
              label="Select Class"
              onChange={handleClassChange}
            >
              <MenuItem value="all">All Classes</MenuItem>
              {classesData.map((classItem) => (
                <MenuItem key={classItem._id} value={classItem._id}>
                  {classItem.className}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={12}>
          <ClassesOverview
            averagePoints={classOverviewData.averagePoints}
            averageTimeSpent={classOverviewData.averageTimeSpent}
            students={classOverviewData.students}
            handleOnClick={() => {}} // Implement this function if needed
            handleOpenDialog={() => {}} // Implement this function if needed
          />
        </Grid>{" "}
        <Grid item xs={12} md={6}>
          <TopThreeLeaderboard
            students={filteredStudents}
            totalAnalytics={userAnalytics}
            selectedClass={selectedClass}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <TeacherCourseCompletionChart
              classesData={filteredClassesData}
              userProgress={filteredUserProgress}
              users={users}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
    <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
      <TeacherCourseActiveChart activeUsersPerCourse={activeUsersPerCourse} />
    </Paper>
  </Grid>
  <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column" }}>
    <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
      <AverageMetricsChart
        userAnalytics={userAllAnalytics}
        relevantStudents={relevantStudents}
      />
    </Paper>
  </Grid>
        <Grid item xs={12}>
          <StudentTable
            selectedClass={selectedClass}
            students={filteredStudents}
            totalAnalytics={userAnalytics}
          />
        </Grid>{" "}
        {/* Add other dashboard components here */}
      </Grid>
    </Container>
  );
};

export default ClassesDashboard;
