import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Paper } from "@mui/material";

const AdminOverview = ({ users }) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);

  useEffect(() => {
    setTotalUsers(users.length);

    const studentCount = users.filter((user) => user.role === "student").length;
    const teacherCount = users.filter((user) => user.role === "teacher").length;

    setTotalStudents(studentCount);
    setTotalTeachers(teacherCount);
  }, [users]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Site Overview
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <Paper elevation={3} style={{ padding: "16px", textAlign: "center" }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3">{totalUsers - 1}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={3} style={{ padding: "16px", textAlign: "center" }}>
            <Typography variant="h6">Total Students</Typography>
            <Typography variant="h3">{totalStudents}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={3} style={{ padding: "16px", textAlign: "center" }}>
            <Typography variant="h6">Total Teachers</Typography>
            <Typography variant="h3">{totalTeachers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={3} style={{ padding: "16px", textAlign: "center" }}>
            <Typography variant="h6">Pending Teacher Requests</Typography>
            <Typography variant="h3">X</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminOverview;
