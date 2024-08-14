import React from "react";
import { Container, Grid, Paper, Typography } from "@mui/material";
import CourseProgress from "./CourseProgress";
import AnalyticsCharts from "./AnalyticsCharts";
import GoalSetting from "./GoalSetting";
import AchievementBadges from "./AchievementBadges";
import QuizPerformance from "./QuizPerformance";
import PlayerLevelUp from "./PlayerLevelUp";
import { useSelector } from "react-redux";
import OverallPerformanceTable from "./OverallPerformanceTable";
import CompletionTimelineChart from "./CompletionTimelineChart";


const Dashboard = () => {
  const userAnalytics = useSelector(
    (state) => state.userAnalytics.userAnalytics
  );

  // Calculate total points across all courses
  const totalPoints = userAnalytics.coursesAnalytics.reduce((acc, course) => {
    return acc + (course.totalPointsEarned || 0);
  }, 0);

  return (
    <Container maxWidth="100%" style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Hello User👋🏼 Let's learn something new today
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            <CourseProgress />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            <PlayerLevelUp totalPoints={totalPoints} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            <AchievementBadges />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            <AnalyticsCharts />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            <GoalSetting />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            <QuizPerformance />
          </Paper>
        </Grid>
      </Grid>
      <div style={{ marginTop: "20px" }}>
        <CompletionTimelineChart />
      </div>
      <div style={{ marginTop: "20px" }}>
        <OverallPerformanceTable />
      </div>
    </Container>
  );
};

export default Dashboard;
