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
import PlayerDashboard from "./PlayerDashboard";

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
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <PlayerDashboard totalPoints={totalPoints} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            <AnalyticsCharts />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            <QuizPerformance />
          </Paper>
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
            <CompletionTimelineChart />
          </Paper>
        </Grid>
        <Grid item xs={12} md={12}>
          {" "}
          <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
            {" "}
            <p className="font-semibold" align="center">
              Overall Student Performance Table
            </p>
            <OverallPerformanceTable />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
