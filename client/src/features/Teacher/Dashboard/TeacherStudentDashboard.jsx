import React, { useEffect, useState } from "react";
import { Container, Grid, Paper, Typography } from "@mui/material";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import TeacherCourseProgress from "./TeacherCourseProgress";
import TeacherPlayerLevelUp from "./TeacherPlayerLevelUp";
import TeacherAchievementBadges from "./TeacherAchievementBadges";
import TeacherQuizPerformance from "./TeacherQuizPerformance";
import TeacherCompletionTimelineChart from "./TeacherCompletionTimelineChart";
import TeacherOverallPerformanceTable from "./TeacherOverallPerformanceTable";
import TeacherAnalyticsCharts from "./TeacherAnalyticsCharts";
import PlayerDashboard from "../../Student/StudentDashboard/PlayerDashboard";
import TeacherPlayerDashboard from "./TeacherPlayerDashboard";
import { useParams } from "react-router";
import { useGetUserMutation } from "../../LoginRegister/userService";
const theme = createTheme();
// const userAnalytics = useSelector((state) => state.userAnalytics.userAnalytics);

// Calculate total points across all courses

const TeacherStudentDashboard = ({ userAnalytics, userProgress }) => {
  const totalPoints = userAnalytics.coursesAnalytics.reduce((acc, course) => {
    return acc + (course.totalPointsEarned || 0);
  }, 0);

  const { studentId } = useParams();
  const userId = studentId;

  const [userInfo, setUserInfo] = useState();
  const [getUser, { data, isLoading, isError }] = useGetUserMutation();

  useEffect(() => {

    const fetchUser = async () => {
      if (userId) {
        try {
          const userData = await getUser(userId).unwrap();
       
          setUserInfo(userData[0]); // Update the state with user data
        } catch (error) {
          console.error("BOBO");
        }
      }
    };

    fetchUser();
  }, [getUser, studentId]);

  return (
    <ThemeProvider theme={theme}>
      {" "}
      <Container maxWidth="100%" style={{ padding: "20px" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <TeacherPlayerDashboard
              totalPoints={totalPoints}
              userProgress={userProgress}
              userInfo={userInfo}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
              <TeacherAnalyticsCharts userAnalytics={userAnalytics} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
              <TeacherQuizPerformance userAnalytics={userAnalytics} />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12}>
          <Paper elevation={3} style={{ padding: "5px", height: "100%" }}>
            {" "}
            <Typography variant="h6" align="center">
              Completion Trends Over Time
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              This chart shows the number of completed items (documents,
              quizzes, and activities) over time.
            </Typography>
            <TeacherCompletionTimelineChart userProgress={userProgress} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={12}>
          {" "}
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            {" "}
            <p className="font-semibold" align="center">
              Overall Student Performance Table
            </p>
            <TeacherOverallPerformanceTable
              userAnalytics={userAnalytics}
              userProgress={userProgress}
            />
          </Paper>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};
export default TeacherStudentDashboard;
