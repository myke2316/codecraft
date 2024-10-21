import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  Typography,
  CircularProgress,
  ListItemButton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Avatar,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import {
  Refresh,
  Notifications,
  ArrowForward,
  Book,
  Assignment,
  Dashboard,
  Person,
} from "@mui/icons-material";
import { useGetAnnouncementsByClassQuery } from "../Teacher/announcementService";
import { useGetUserMutation } from "../LoginRegister/userService";
import "react-quill/dist/quill.snow.css";

export default function StudentClassLayout() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const theme = useTheme();
  const classDetails = useSelector((state) => state.class.class);
  const [getUser] = useGetUserMutation();
  const [teacherName, setTeacherName] = useState("");
  const {
    data: announcements,
    isLoading,
    refetch,
  } = useGetAnnouncementsByClassQuery(classId);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    if (classDetails && classDetails.teacher) {
      getUser(classDetails.teacher)
        .unwrap()
        .then((userData) => {
          setTeacherName(userData[0].username);
          console.log(userData);
        })
        .catch((error) => {
          console.error("Failed to fetch teacher information:", error);
        });
    }
  }, [classDetails, getUser]);

  const handleRefreshAnnouncements = () => {
    refetch();
  };

  const handleOpenDialog = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnnouncement(null);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Class Details */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #3f51b5, 	#928fce)",
              color: "white",
              textAlign: "center",
            }}
          >
            {/* Avatar for the Teacher */}

            {/* Class Name in Bold */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                letterSpacing: "0.5px",
                mb: 1,
                color: "white",
              }}
            >
              {classDetails?.className || "Class Name"}
            </Typography>

            {/* Teacher Name */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Person sx={{ mr: 1, color: "white", fontSize: 20 }} />
              <Typography
                variant="body2"
                color="white"
                sx={{ fontWeight: "500" }}
              >
                Teacher: {teacherName || "Loading..."}
              </Typography>
            </Box>

            {/* Class Invite Code */}
            <Typography
              variant="body2"
              sx={{
                backgroundColor: alpha(theme.palette.common.white, 0.15),
                p: 0.5,
                borderRadius: "8px",
                fontWeight: "600",
                display: "inline-block",
              }}
            >
              Invite Code: {classDetails?.inviteCode || "N/A"}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />
          <List>
            {[
              { text: "Class Details", icon: "📚", route: "classHome" },
              { text: "View Assignments", icon: "📝", route: "assignment" },
              { text: "View Dashboard", icon: "📊", route: "dashboard" },
            ].map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.route)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {/* Emoji Icon */}
                  <Box
                    component="span"
                    sx={{
                      mr: 2,
                      fontSize: "1.5rem", // Larger emoji size for better visibility
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.text}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Announcements Section */}
          <Box sx={{ mt: 4 }}>
            {/* Header with Title and Refresh Icon */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(135deg, #3f51b5, 	#928fce)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                padding: "6px 12px",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: "semi-bold",
                  color: "white",
                  // Indigo to purple
                }}
              >
                Announcements
              </Typography>
              <IconButton
                onClick={handleRefreshAnnouncements}
                size="small"
                sx={{
                  color: "#FFF",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <Refresh sx={{ color: "#FFF" }} />{" "}
                {/* Change the color to white */}
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Announcements List or Loading State */}
            {isLoading ? (
              <CircularProgress
                size={24}
                sx={{ display: "block", margin: "0 auto" }}
              />
            ) : announcements && announcements.length > 0 ? (
              <List disablePadding>
                {announcements.map((announcement) => (
                  <ListItemButton
                    key={announcement._id}
                    onClick={() => handleOpenDialog(announcement)}
                    sx={{
                      borderRadius: "12px",
                      mb: 1,
                      padding: "12px",
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)",
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Notifications
                        sx={{
                          mr: 2,
                          fontSize: "1.5rem",
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          flexGrow: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {announcement.title}
                      </Typography>
                      <ArrowForward sx={{ ml: 1, color: "text.secondary" }} />
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 2 }}
              >
                No announcements available
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${280}px)` },
          ml: { sm: `${280}px` },
        }}
      >
        <Outlet />
      </Box>

      {/* Dialog for announcement details */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            backgroundImage: "none",
            boxShadow: 3, // Add shadow for depth
            borderRadius: 2, // Rounded corners for a modern look
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #3f51b5, 	#928fce)",
            color: "primary.contrastText",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& svg": {
              marginRight: 1, // Space between icon and text
            },
          }}
        >
          {/* Use an appropriate icon */}
          Announcement
        </DialogTitle>
        <DialogContent dividers>
          {selectedAnnouncement && (
            <Box>
              <Typography
                variant="h5"
                component="div"
                sx={{ mb: 2, fontWeight: "bold", color: "text.primary" }}
              >
                {selectedAnnouncement.title}
              </Typography>
              <Box
                component="div"
                sx={{
                  "& h1, & h2, & h3, & h4, & h5, & h6": {
                    fontWeight: "bold",
                    mb: 1,
                    color: "text.primary",
                  },
                  "& p": {
                    mb: 2,
                    color: "text.secondary",
                  },
                  "& strong": {
                    fontWeight: "bold",
                  },
                  "& ul, & ol": {
                    pl: 4,
                    mb: 2,
                  },
                  "& a": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html: selectedAnnouncement.content,
                }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Published on:{" "}
                {new Date(selectedAnnouncement.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
}
