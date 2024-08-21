import React, { useEffect, useState } from "react";
import { Container, Grid, Paper, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  useFetchAllClassesMutation,

} from "../../Teacher/classService";
import { useAggregateAllAnalyticsMutation } from "../../Student/userAnalyticsService";
import { useGetAllProgressMutation } from "../../Student/studentCourseProgressService";
import { useGetAllUserMutation } from "../../LoginRegister/userService";
import AdminUserAnalytics from "./AdminDashboardFiles/AdminUserAnalytics";
import AdminOverview from "./AdminDashboardFiles/AdminOverview";
import AdminAnalyticsChart from "./AdminDashboardFiles/AdminAnalyticsChart";

const theme = createTheme();

const AdminDashboard = () => {
  const [classesData, setClassesData] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [users, setUsers] = useState([]);

  const [fetchClass] = useFetchAllClassesMutation();
  const [getAllAnalytics] = useAggregateAllAnalyticsMutation();
  const [getAllProgress] = useGetAllProgressMutation();
  const [getAllUser] = useGetAllUserMutation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesResponse = await fetchClass();
        setClassesData(classesResponse.data);

        const analyticsResponse = await getAllAnalytics();
        setUserAnalytics(analyticsResponse.data);

        const progressResponse = await getAllProgress();
        setUserProgress(progressResponse.data);

        const usersResponse = await getAllUser();
        setUsers(usersResponse.data);

        console.log("CLASSES:", classesResponse.data);
        console.log("ANALYTICS:", analyticsResponse.data);
        console.log("PROGRESS:", progressResponse.data);
        console.log("USERS:", usersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [fetchClass, getAllAnalytics, getAllProgress, getAllUser]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="100%" style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Paper elevation={2} style={{ padding: "20px", height: "auto" }}>
              <AdminOverview userAnalytics={userAnalytics} users={users} />
            </Paper>
          </Grid>
       
      
          <Grid item xs={12} md={12}>
            <Paper elevation={3} style={{ padding: "20px", height: "100%" }}>
              <AdminUserAnalytics userAnalytics={userAnalytics} users={users} />
            </Paper>
          </Grid>
        </Grid>
        <div style={{ marginTop: "20px" }}>
          {/* <AdminCompletionRateChart userProgress={userProgress} /> */}
        </div>
      </Container>
    </ThemeProvider>
  );
};

export default AdminDashboard;
