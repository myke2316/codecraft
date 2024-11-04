import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, Paper, Box, Icon } from "@mui/material";
import { styled } from "@mui/material/styles";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SchoolIcon from "@mui/icons-material/School";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  color: theme.palette.text.secondary,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[8],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  borderRadius: "50%",
  padding: theme.spacing(2),
  display: "inline-flex",
  marginBottom: theme.spacing(2),
}));

const StatCard = ({ title, value, icon }) => (
  <StyledPaper elevation={3}>
    <IconWrapper>
      <Icon
        component={icon}
        fontSize="large"
        sx={{ color: "background.paper" }}
      />
    </IconWrapper>
    <Typography
      variant="h6"
      gutterBottom
      sx={{ fontWeight: "medium", color: "text.primary" }}
    >
      {title}
    </Typography>
    <Typography variant="h3" sx={{ fontWeight: "bold", color: "text.primary" }}>
      {value}
    </Typography>
  </StyledPaper>
);

const AdminOverview = ({ users }) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalTeachersRequest, setTotalTeachersRequest] = useState(0);
  const [totalAdmin, setTotalAdmin] = useState(0);

  useEffect(() => {
    setTotalUsers(users.length);
    const studentCount = users.filter((user) => user.role === "student").length;
    const teacherCount = users.filter(
      (user) => user.role === "teacher" && user.approved === "true"
    ).length;
    const adminCount = users.filter((user) => user.role === "admin").length;
    const teacherRequestCount = users.filter(
      (user) => user.approved === "false"
    ).length;

    setTotalStudents(studentCount);
    setTotalTeachers(teacherCount);
    setTotalAdmin(adminCount);
    setTotalTeachersRequest(teacherRequestCount);
  }, [users]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={totalStudents + totalTeachers}
            icon={PeopleAltIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={SchoolIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Teachers"
            value={totalTeachers}
            icon={SupervisorAccountIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Teacher Requests"
            value={totalTeachersRequest}
            icon={HourglassEmptyIcon}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminOverview;
