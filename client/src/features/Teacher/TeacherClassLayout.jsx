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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  useMediaQuery,
  Drawer,
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
  Menu as MenuIcon,
  ChevronLeft,
} from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import { useGetAnnouncementsByClassQuery } from "./announcementService";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function TeacherClassLayout() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get class information from Redux state
  const classInfo = useSelector((state) => state.class.class);

  // Filter the class using the classId
  const selectedClass = classInfo.find((cls) => cls._id === classId);
  const [copied, setCopied] = useState(false);
  const inviteCode = selectedClass?.inviteCode || "N/A";
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Local state for announcements dialog
  const [openDialog, setOpenDialog] = useState(false);
  const {
    data: announcements,
    isLoading,
    refetch,
  } = useGetAnnouncementsByClassQuery(classId);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleOpenDialog = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnnouncement(null);
  };

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
          {selectedClass.className || "Class Name"}
        </Typography>
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
            onClick={refetch}
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
          <CircularProgress size={24} sx={{ display: "block", margin: "0 auto" }} />
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
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            boxShadow: "5px 0 15px rgba(0, 0, 0, 0.1)",
            zIndex: theme.zIndex.drawer,
          }}
        >
          <Box sx={{ visibility: sidebarOpen ? "visible" : "hidden" }}>
            {sidebarContent}
          </Box>
        </Box>
      )}

      {/* Toggle button for sidebar */}
      {!isMobile && (
        <IconButton
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
        </IconButton>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${sidebarOpen ? 280 : 0}px)` },
          ml: { md: isMobile ? 0 :`${sidebarOpen ? 280 : 0}px` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleSidebarToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <ToastContainer />
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

      
    </Box>
  );
}