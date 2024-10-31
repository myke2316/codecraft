import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useFetchAllClassesMutation } from "../../Teacher/classService";
import { useAggregateAllAnalyticsMutation } from "../../Student/userAnalyticsService";
import { useGetAllProgressMutation } from "../../Student/studentCourseProgressService";
import { useGetAllUserMutation } from "../../LoginRegister/userService";
import AdminUserAnalytics from "./AdminDashboardFiles/AdminUserAnalytics";
import AdminOverview from "./AdminDashboardFiles/AdminOverview";
import AdminAnalyticsChart from "./AdminDashboardFiles/AdminAnalyticsChart";

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(110, 97, 171)", // Yellow
    },
    secondary: {
      main: "#000000", // Black
    },
    background: {
      default: "#F5F5F5", // Light gray
      paper: "#FFFFFF", // White
    },
    text: {
      primary: "#000000", // Black
      secondary: "#333333", // Dark gray
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFD700",
          color: "#000000",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "rgb(110, 97, 171)",
          color: "#FFFFFF",
        },
      },
    },
  },
});

const AdminDashboard = () => {
  const [classesData, setClassesData] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [fetchClass] = useFetchAllClassesMutation();
  const [getAllAnalytics] = useAggregateAllAnalyticsMutation();
  const [getAllProgress] = useGetAllProgressMutation();
  const [getAllUser] = useGetAllUserMutation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchClass, getAllAnalytics, getAllProgress, getAllUser]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <List>
      {["Dashboard", "Users", "Analytics"].map((text, index) => (
        <ListItem button key={text}>
          <ListItemIcon>
            {index === 0 ? (
              <DashboardIcon />
            ) : index === 1 ? (
              <PeopleIcon />
            ) : (
              <BarChartIcon />
            )}
          </ListItemIcon>
          <ListItemText primary={text} />
        </ListItem>
      ))}
    </List>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Admin Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawerContent}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${240}px)` },
            mt: 8,
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Container maxWidth="xl">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
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
                        gutterBottom
                        className="mb-6 text-black-800 font-bold"
                        sx={{ color: "white" }}
                      >
                        User Analytics
                      </Typography>
                    </Box>
                    <AdminOverview
                      userAnalytics={userAnalytics}
                      users={users}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <AdminAnalyticsChart
                      userAnalytics={userAnalytics}
                      classesData={classesData}
                      userProgress={userProgress}
                      users={users}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <AdminUserAnalytics
                      userAnalytics={userAnalytics}
                      users={users}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
