import { Outlet, useNavigate, useParams } from "react-router";
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
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import RefreshIcon from "@mui/icons-material/Refresh"; // Import RefreshIcon

import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useEffect, useState } from "react";
import { useGetAnnouncementsByClassQuery } from "../Teacher/announcementService";

function StudentClassLayout() {
  const navigate = useNavigate();
  const { classId } = useParams(); // Replace with actual classId or get it from params or context
  const {
    data: announcements,
    isLoading,
    refetch,
  } = useGetAnnouncementsByClassQuery(classId);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Handler function to refresh announcements
  const handleRefreshAnnouncements = () => {
    refetch(); // Trigger refetch to get the latest announcements
  };

  // Handler function to open dialog
  const handleOpenDialog = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenDialog(true);
  };

  // Handler function to close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnnouncement(null);
  };

  return (
    <div className="flex justify-center">
      {/* Sidebar */}
      <div className="py-6">
        <Box
          sx={{
            width: "280px",
            height: "auto", // Full height for sidebar
            bgcolor: "background.default",
            boxShadow: 3,
            p: 3,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto", // Add scroll for overflow
          }}
        >
          {/* Class Section */}
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold", mb: 2, color: "primary.main" }}
          >
            Class
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem disablePadding>
              <Button
                onClick={() => navigate("classHome")}
                variant="text"
                sx={{
                  justifyContent: "flex-start",
                  width: "100%",
                  color: "text.primary",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    color: "primary.main",
                  },
                }}
                startIcon={
                  <span role="img" aria-label="Class">
                    📚
                  </span>
                }
              >
                Class Details
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <Button
                onClick={() => navigate("assignment")}
                variant="text"
                sx={{
                  justifyContent: "flex-start",
                  width: "100%",
                  color: "text.primary",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    color: "primary.main",
                  },
                }}
                startIcon={
                  <span role="img" aria-label="Assignment">
                    📝
                  </span>
                }
              >
                View Assignments
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <Button
                onClick={() => navigate("dashboard")}
                variant="text"
                sx={{
                  justifyContent: "flex-start",
                  width: "100%",
                  color: "text.primary",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    color: "primary.main",
                  },
                }}
                startIcon={
                  <span role="img" aria-label="Dashboard">
                    📊
                  </span>
                }
              >
                View Dashboard
              </Button>
            </ListItem>
           
          </List>

          {/* Announcements Section */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: "bold",
                mb: 1,
                color: "primary.main",
                display: "flex",
                alignItems: "center",
              }}
            >
              Announcements
              <Button
                onClick={handleRefreshAnnouncements}
                sx={{ ml: 1 }}
                color="inherit"
                size="small"
              >
                <RefreshIcon />
              </Button>
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Display loading state */}
            {isLoading && <CircularProgress />}

            {/* Display announcements or empty message */}
            {announcements && announcements.length > 0 ? (
              <List>
                {announcements.map((announcement) => (
                  <ListItem key={announcement._id} disablePadding>
                    <ListItemButton
                      onClick={() => handleOpenDialog(announcement)}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        mb: 1,
                        p: 2,
                        boxShadow: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor: "action.hover",
                          boxShadow: 4,
                          transform: "translateY(-2px)",
                        },
                        overflow: "hidden", // Ensure overflow is hidden
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", flex: 1 }}
                      >
                        <NotificationsIcon
                          sx={{ mr: 2, color: "primary.main" }}
                        />
                        <Typography
                          variant="body2"
                          color="text.primary"
                          noWrap
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap", // Ensure text does not wrap
                            maxWidth: "calc(100% - 40px)", // Adjust maxWidth considering icon and padding
                          }}
                        >
                          {announcement.title}
                        </Typography>
                      </Box>
                      <IconButton
                        edge="end"
                        aria-label="details"
                        sx={{ color: "text.secondary" }}
                      >
                        <ArrowForwardIcon />
                      </IconButton>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No announcements available
              </Typography>
            )}
          </Box>
        </Box>
      </div>

      <div className="m-auto w-[100%]">
        <Outlet />
      </div>

      {/* Dialog for announcement details */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "2px solid",
            borderColor: "secondary.main",
          }}
        >
          📢 Announcement 📢
        </DialogTitle>
        <DialogContent
          sx={{
            bgcolor: "background.paper",
            padding: 3,
            borderRadius: 2,
          }}
        >
          {selectedAnnouncement && (
            <Box>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: "text.primary",
                }}
              >
                📑 {selectedAnnouncement.title}
              </Typography>
              <Box
                component="div"
                sx={{
                  "& h1": { fontSize: "2rem", fontWeight: "bold", mb: 1 },
                  "& h2": { fontSize: "1.75rem", fontWeight: "bold", mb: 1 },
                  "& h3": { fontSize: "1.5rem", fontWeight: "bold", mb: 1 },
                  "& h4": { fontSize: "1.25rem", fontWeight: "bold", mb: 1 },
                  "& h5": { fontSize: "1rem", fontWeight: "bold", mb: 1 },
                  "& h6": { fontSize: "0.875rem", fontWeight: "bold", mb: 1 },
                  "& p": { marginBottom: "1rem", lineHeight: 1.6 },
                  "& strong": { fontWeight: "bold" },
                  // Add more styles if needed
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
        <DialogActions
          sx={{
            bgcolor: "background.default",
            borderTop: "1px solid",
            borderColor: "divider",
            p: 2,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default StudentClassLayout;
