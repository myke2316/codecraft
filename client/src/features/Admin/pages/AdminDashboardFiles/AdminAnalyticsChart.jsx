import React, { useMemo } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import PieChartCompletion from "./PieChartCompletion";
import ActiveUsersChart from "./ActiveUsersChart";
import CourseActiveChart from "./CourseActiveChart";
import AverageTimeSpentChart from "./AverageTimeSpentChart";

function AdminAnalyticsChart({
  userAnalytics,
  classesData,
  userProgress,
  users,
}) {
  console.log("User Analytics", userAnalytics);
  console.log("Classes Data", classesData);
  console.log("User Progress", userProgress);
  console.log("Users", users);

  const isDateMatch = (date, formattedDate) => {
    return date && new Date(date).toISOString().split("T")[0] === formattedDate;
  };

  const courseCompletionData = useMemo(() => {
    if (!users || users.length === 0) {
      return [
        { name: "Completed", value: 0 },
        { name: "Not Completed", value: 0 },
      ];
    }
    const students = users.filter((user) => user?.role === "student");
    const completed = students.filter((user) => user?.courseCompleted).length;
    const notCompleted = students.length - completed;
    return [
      { name: "Completed", value: completed },
      { name: "Not Completed", value: notCompleted },
    ];
  }, [users]);

  const activeUsersData = useMemo(() => {
    if (!userProgress || userProgress.length === 0) {
      return [];
    }

    const allDates = userProgress.flatMap((up) =>
      up.coursesProgress.flatMap((course) => {
        const finishedDates = [
          ...(course.dateFinished ? [new Date(course.dateFinished)] : []),
          ...course.lessonsProgress.flatMap((lesson) => {
            const lessonFinishedDates = [
              ...(lesson.dateFinished ? [new Date(lesson.dateFinished)] : []),
              ...lesson.documentsProgress.flatMap((doc) =>
                doc.dateFinished ? [new Date(doc.dateFinished)] : []
              ),
              ...lesson.quizzesProgress.flatMap((quiz) =>
                quiz.dateFinished ? [new Date(quiz.dateFinished)] : []
              ),
              ...lesson.activitiesProgress.flatMap((activity) =>
                activity.dateFinished ? [new Date(activity.dateFinished)] : []
              ),
            ];
            return lessonFinishedDates;
          }),
        ];
        return finishedDates;
      })
    );

    if (allDates.length === 0) {
      return [];
    }

    const earliestDate = new Date(Math.min(...allDates));
    const latestDate = new Date(Math.max(...allDates));
    const daysData = [];
    const activeUsersMap = new Map();

    // Calculate the number of days to include the end date
    const totalDays = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(earliestDate);
      date.setDate(earliestDate.getDate() + i);
      const formattedDate = date.toISOString().split("T")[0];

      const activeUsersSet = new Set();

      userProgress.forEach((up) => {
        up.coursesProgress.forEach((course) => {
          if (isDateMatch(course.dateFinished, formattedDate)) {
            activeUsersSet.add(up.userId);
          }

          course.lessonsProgress.forEach((lesson) => {
            if (isDateMatch(lesson.dateFinished, formattedDate)) {
              activeUsersSet.add(up.userId);
            }

            lesson.documentsProgress.forEach((document) => {
              if (isDateMatch(document.dateFinished, formattedDate)) {
                activeUsersSet.add(up.userId);
              }
            });

            lesson.quizzesProgress.forEach((quiz) => {
              if (isDateMatch(quiz.dateFinished, formattedDate)) {
                activeUsersSet.add(up.userId);
              }
            });

            lesson.activitiesProgress.forEach((activity) => {
              if (isDateMatch(activity.dateFinished, formattedDate)) {
                activeUsersSet.add(up.userId);
              }
            });
          });
        });
      });

      const currentActiveCount = activeUsersSet.size;
      const previousActiveCount = activeUsersMap.get(formattedDate) || 0;
      const newActiveCount = Math.max(currentActiveCount, previousActiveCount);
      activeUsersMap.set(formattedDate, newActiveCount);

      daysData.push({ date: formattedDate, activeUsers: newActiveCount });
    }

// for (let i = 1; i < daysData.length; i++) {
//   if (daysData[i].activeUsers < daysData[i - 1].activeUsers) {
//     daysData[i].activeUsers = daysData[i - 1].activeUsers;
//   }
// }

    return daysData;
  }, [userProgress]);

  const activeUsersPerCourse = useMemo(() => {
    if (!users || !userProgress) {
      return [];
    }

    const courseActiveUsersMap = {};

    users.forEach((user) => {
      const userProgressEntry = userProgress.find(
        (up) => up.userId.toString() === user._id.toString()
      );

      if (userProgressEntry) {
        let userIsActiveInACourse = false;

        userProgressEntry.coursesProgress.forEach((courseProgress) => {
          if (userIsActiveInACourse) return;

          const courseId = courseProgress.courseId.toString();

          if (!courseActiveUsersMap[courseId]) {
            courseActiveUsersMap[courseId] = [];
          }

          let hasUnfinishedItems = false;

          courseProgress.lessonsProgress.forEach((lesson) => {
            if (!lesson.dateFinished) hasUnfinishedItems = true;

            lesson.documentsProgress.forEach((document) => {
              if (!document.dateFinished) hasUnfinishedItems = true;
            });

            lesson.quizzesProgress.forEach((quiz) => {
              if (!quiz.dateFinished) hasUnfinishedItems = true;
            });

            lesson.activitiesProgress.forEach((activity) => {
              if (!activity.dateFinished) hasUnfinishedItems = true;
            });
          });

          if (hasUnfinishedItems) {
            courseActiveUsersMap[courseId].push(user._id);
            userIsActiveInACourse = true;
          }
        });
      }
    });

    return Object.keys(courseActiveUsersMap).map((courseId) => ({
      courseId,
      activeUsers: courseActiveUsersMap[courseId],
    }));
  }, [users, userProgress]);

  return (
    <Container maxWidth={false} className="p-6 bg-gray-100">
      <Box
        sx={{
          width: "100%",
          height: "90px",
          backgroundColor: "rgb(110, 97, 171)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "10px",
          borderRadius: "3px",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          className="mb-6 text-white-800 font-bold"
          sx={{ color: "white" }}
        >
          Admin Analytics Dashboard
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="p-4 h-full">
            <Typography
              variant="h5"
              className="mb-6 text-black-800 font-bold"
              sx={{ textAlign: "center" }}
            >
              Course Completion Overview
            </Typography>
            <Box className="h-64">
              <PieChartCompletion data={courseCompletionData} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="p-4">
            <Typography
              variant="h5"
              className="mb-6 text-black-800 font-bold"
              sx={{ textAlign: "center" }}
            >
              Users Per Course
            </Typography>
            <Box className="h-[400px]">
              <CourseActiveChart activeUsersPerCourse={activeUsersPerCourse} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} className="p-4">
            <Box
              sx={{
                width: "100%",
                height: "80px",
                backgroundColor: "rgb(110, 97, 171)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "10px",
                borderRadius: "3px",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                className="mb-6 text-black-800 font-bold"
                sx={{ color: "white" }}
              >
                Active Users Overtime
              </Typography>
            </Box>
            <Box className="h-[500px]">
              <ActiveUsersChart data={activeUsersData} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} className="p-4">
            <Box
              sx={{
                width: "100%",
                height: "80px",
                backgroundColor: "rgb(110, 97, 171)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "10px",
                borderRadius: "3px",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                className="mb-6 text-black-800 font-bold"
                sx={{ color: "white" }}
              >
                Average Time Spent Per Course
              </Typography>
            </Box>
            <Box className="h-[400px]">
              <AverageTimeSpentChart userAnalytics={userAnalytics} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AdminAnalyticsChart;