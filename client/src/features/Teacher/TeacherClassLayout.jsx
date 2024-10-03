import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  CircularProgress,
  ListItemButton,
  IconButton,
  useTheme,
  alpha,Dialog,DialogTitle,DialogContent,DialogActions,Button,
} from "@mui/material";
import {
  Refresh,
  Person,
  Class,
  Announcement,
  Assignment,
  Dashboard,
  Notifications,
  ArrowForward,
} from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import { useGetAnnouncementsByClassQuery } from "./announcementService";

export default function TeacherClassLayout() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const theme = useTheme();

  // Get class information from Redux state
  const classInfo = useSelector((state) => state.class.class); // array of classes

  // Filter the class using the classId
  const selectedClass = classInfo.find((cls) => cls._id === classId);

  // Local state for announcements dialog
  const [openDialog, setOpenDialog] = useState(false);
  const {
    data: announcements,
    isLoading,
    refetch,
  } = useGetAnnouncementsByClassQuery(classId);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // If no class is found, show a loading spinner or a message
  if (!selectedClass) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Dummy announcements data for now


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
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Class Details */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #3f51b5, #928fce)",
              color: "white",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                letterSpacing: "0.5px",
                mb: 1,
                color: "white",
              }}
            >
              {selectedClass.className || "Class Name"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 1,
              }}
            >
         
            </Box>
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
              Invite Code: {selectedClass.inviteCode || "N/A"}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <List>
            {[
              { text: "Class Details", icon: <Class />, route: "classHome" },
              { text: "Manage Announcements", icon: <Announcement />, route: "announcement" },
              { text: "Manage Assignments", icon: <Assignment />, route: "assignment" },
          
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
                  <Box component="span" sx={{ mr: 2, display: "flex", alignItems: "center" }}>
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(135deg, #3f51b5, #928fce)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                padding: "6px 12px",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2" sx={{ fontWeight: "semi-bold", color: "white" }}>
                Announcements
              </Typography>
              <IconButton
                size="small"
                sx={{
                  color: "#FFF",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <Refresh sx={{ color: "#FFF" }} />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {announcements && announcements.length > 0 ? (
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
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
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
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 2 }}>
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
            "& p": { mb: 2, color: "text.secondary" },
            "& strong": { fontWeight: "bold" },
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
