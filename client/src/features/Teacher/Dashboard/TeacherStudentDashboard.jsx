import React from "react";
import { Container, Grid, Paper, Typography } from "@mui/material";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import TeacherCourseProgress from "./TeacherCourseProgress";
import TeacherPlayerLevelUp from "./TeacherPlayerLevelUp";
import TeacherAchievementBadges from "./TeacherAchievementBadges";
import TeacherQuizPerformance from "./TeacherQuizPerformance";
import TeacherCompletionTimelineChart from "./TeacherCompletionTimelineChart";
import TeacherOverallPerformanceTable from "./TeacherOverallPerformanceTable";
import TeacherAnalyticsCharts from "./TeacherAnalyticsCharts";
const theme = createTheme();
// const userAnalytics = useSelector((state) => state.userAnalytics.userAnalytics);

// Calculate total points across all courses

const TeacherStudentDashboard = ({ userAnalytics, userProgress }) => {
  const totalPoints = userAnalytics.coursesAnalytics.reduce((acc, course) => {
    return acc + (course.totalPointsEarned || 0);
  }, 0);

  
  return (
    <ThemeProvider theme={theme}>
      {" "}
      <Container maxWidth="100%" style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
              <TeacherCourseProgress userProgress={userProgress} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
              <TeacherPlayerLevelUp totalPoints={totalPoints} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
              <TeacherAchievementBadges />
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
              <TeacherAnalyticsCharts userAnalytics={userAnalytics} />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
              <TeacherQuizPerformance userAnalytics={userAnalytics} />
            </Paper>
          </Grid>
        </Grid>
        <div style={{ marginTop: "20px" }}>
          <TeacherCompletionTimelineChart userProgress={userProgress} />
        </div>
        <div style={{ marginTop: "20px" }}>
          <TeacherOverallPerformanceTable userAnalytics={userAnalytics} userProgress={userProgress} />
        </div>
      </Container>
    </ThemeProvider>
  );
};
export default TeacherStudentDashboard;
