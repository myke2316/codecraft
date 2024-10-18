import React, { useEffect, useState } from "react";
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
import { useGetScoreByStudentIdQuery } from "../../Class/submissionAssignmentService";

const Dashboard = () => {
  
  const studentId = useSelector((state) => state.user.userDetails._id); 
  const [assignmentGrades, setAssignmentGrades] = useState(0);
  const userAnalytics = useSelector(
    (state) => state.userAnalytics.userAnalytics
  );
  const { data: scoresData, isFetching } = useGetScoreByStudentIdQuery(studentId);
  useEffect(() => {
    if (!isFetching && scoresData) {
      // Sum up the grades from the scores array
      const submissionPoints = scoresData.scores.reduce((acc, score) => {
        return acc + (score.grade || 0);
      }, 0);

      // Combine the points from submissions and analytics
      setAssignmentGrades(submissionPoints);
    }
  }, [scoresData, userAnalytics, isFetching]);

  // Calculate total points across all courses
  const totalPoints = userAnalytics.coursesAnalytics.reduce((acc, course) => {
    return acc + (course.totalPointsEarned || 0);
  }, 0);
 
  return (
    <Container maxWidth="100%" style={{ padding: "20px" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <PlayerDashboard totalPoints={totalPoints+assignmentGrades} />
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
