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
  Tooltip,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import {
  Refresh,
  Notifications,
  ArrowForward,
  Person,
  Menu as MenuIcon,
  ChevronLeft,
} from "@mui/icons-material";
import { useGetAnnouncementsByClassQuery } from "../Teacher/announcementService";
import { useGetUserMutation } from "../LoginRegister/userService";
import "react-quill/dist/quill.snow.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function StudentClassLayout() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [copied, setCopied] = useState(false);
  const inviteCode = classDetails.inviteCode || "N/A";
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (classDetails && classDetails.teacher) {
      getUser(classDetails.teacher)
        .unwrap()
        .then((userData) => {
          setTeacherName(userData[0].username);
        })
        .catch((error) => {
          console.error("Failed to fetch teacher information:", error);
        });
    }
  }, [classDetails, getUser]);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

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

  const sidebarContent = (
    <Box sx={{ p: 3, width: 280 }}>
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
          {classDetails?.className || "Class Name"}
        </Typography>

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

        <Typography
          variant="body2"
          sx={{
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            p: 0.5,
            borderRadius: "8px",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Invite Code: {inviteCode}
          <Tooltip title={copied ? "Copied!" : "Copy Invite Code"}>
            <IconButton
              onClick={handleCopy}
              size="small"
              sx={{ ml: 1, color: "inherit" }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
              <Box
                component="span"
                sx={{
                  mr: 2,
                  fontSize: "1.5rem",
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
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: "semi-bold",
              color: "white",
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
            <Refresh sx={{ color: "#FFF" }} />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

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
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={handleSidebarToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: sidebarOpen ? 280 : 0,
            flexShrink: 0,
            height: "100vh",
            position: "fixed",
            overflowY: "auto",
            overflowX: "hidden",
            bgcolor: "background.paper",
            borderRight: sidebarOpen ?`1px solid ${theme.palette.divider}` : undefined,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            boxShadow: sidebarOpen ? "5px 0 15px rgba(0, 0, 0, 0.1)" : undefined
          }}
        >
          <Box sx={{ visibility: sidebarOpen ? "visible" : "hidden" }}>
            {sidebarContent}
          </Box>
        </Box>
      )}

      {/* Toggle button for sidebar */}
     {!isMobile && ( <IconButton
        onClick={handleSidebarToggle}
        sx={{
          position: "fixed",
          right: 16,
          top: 16,
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: "#928fce",
          color: "white",
          '&:hover': {
            backgroundColor: "#6e61ab",
          },
        }}
      >
        {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
      </IconButton>)}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: {
            xs: '100%',
            md: `calc(100% - ${sidebarOpen ? 280 : 0}px)`,
          },
          ml: {
            xs: 0,
            md: sidebarOpen ? '280px' : 0,
          },
          transition: 'margin 0.3s, width 0.3s',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
        <Outlet />
        {/* <ToastContainer /> */}
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
            boxShadow: 3,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #3f51b5, #928fce)",
            color: "primary.contrastText",
            fontWeight: "bold",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& svg": {
              marginRight: 1,
            },
          }}
        >
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

      {/* <ToastContainer /> */}
    </Box>
  );
}