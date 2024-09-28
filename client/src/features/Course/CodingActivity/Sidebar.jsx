import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Tooltip,
  Card,
  List,
  ListItem,
  Typography,
  Divider,
  Box,
  Zoom,
  CardMedia,
  CardContent,
  Grid,
  IconButton,
  Drawer,
  CssBaseline,
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
  DialogActions,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // For finished activities
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"; // For in-progress activities
import LockIcon from "@mui/icons-material/Lock"; // For locked activities

export default function Sidebar({ courseId, lessonId, userProgress }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false); // State to control drawer visibility
  const [openImage, setOpenImage] = useState(false); // State to control image modal
  const [selectedImage, setSelectedImage] = useState(""); // To store the selected image for full view
  const { activityId } = useParams();
  const navigate = useNavigate()
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm")); // Fullscreen modal on small screens

  const course = useSelector((state) => state.course.courseData);
  const selectedCourse = course.find((c) => c._id === courseId);
  const selectedLesson = selectedCourse?.lessons.find(
    (lesson) => lesson._id === lessonId
  );
  const selectedActivity = selectedLesson?.activities.find(
    (activity) => activity._id === activityId
  );

  const courseProgress = userProgress.coursesProgress.find(
    (cp) => cp.courseId === courseId
  );
  const lessonProgress = courseProgress?.lessonsProgress.find(
    (lp) => lp.lessonId === lessonId
  );

  const testCases = selectedActivity?.testCases || [];

  const toggleDrawer = () => setDrawerOpen(!drawerOpen); // Toggle drawer open/close
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenImage(true);
  }; // Handle image click to open modal
  const handleCloseImage = () => setOpenImage(false); // Close image modal

  const getActivityIcon = (activityProgress) => {
    if (activityProgress.locked) {
      return <LockIcon sx={{ color: "#ff5722", mr: 1 }} />; // Locked activity
    } else if (activityProgress.dateFinished) {
      return <CheckCircleIcon sx={{ color: "#4caf50", mr: 1 }} />; // Finished activity
    } else {
      return <HourglassEmptyIcon sx={{ color: "#000000", mr: 1 }} />; // In-progress activity
    }
  };

  const drawerContent = (
    <Box
      sx={{
        width: 300,
        padding: "24px",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "#f4f6f8", // Light background for the drawer
        borderRadius: "16px", // Smoothen edges
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)", // Floating effect
      }}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, marginBottom: 3 }}
      >
        {selectedLesson?.title} Activities
      </Typography>
      {/* Back/Home Button */}
      <Button
        variant="outlined"
        color="primary"
        onClick={() =>
          navigate(
            `/course/${courseId}/lesson/${lessonId}/activity/activityList`
          )
        }
        sx={{ mb: 2, borderRadius: "10px" }}
      >
        Back to Activity List
      </Button>
      <List>
        {selectedLesson?.activities.map((activity) => {
          const activityProgress = lessonProgress?.activitiesProgress.find(
            (ap) => ap.activityId === activity._id
          );
          const isLocked = activityProgress?.locked;
          const isSelected = activity._id === activityId;

          return (
            <Link
              to={
                isLocked
                  ? "#"
                  : `/course/${courseId}/lesson/${lessonId}/activity/${activity._id}`
              }
              key={activity._id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItem
                button
                selected={isSelected}
                disabled={isLocked}
                sx={{
                  mb: 2,
                  p: 1.5,
                  borderRadius: "10px",
                  boxShadow: isSelected
                    ? "0 4px 8px rgba(0, 0, 0, 0.1)"
                    : "none",
                  backgroundColor: isSelected ? "#1976d2" : "#ffffff",
                  color: isSelected ? "#000000" : "#000000",
                  "&:hover": {
                    backgroundColor: isSelected ? "#1565c0" : "#f0f0f0",
                  },
                  opacity: isLocked ? 0.6 : 1,
                  transition: "background-color 0.3s ease", // Smooth background color transition
                  display: "flex", // Icon and text inline
                  alignItems: "center",
                }}
              >
                {getActivityIcon(activityProgress)}
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  {activity.title}
                </Typography>
              </ListItem>
            </Link>
          );
        })}
      </List>

      <Divider sx={{ my: 3 }} />

      {testCases.length > 0 && (
        <Box sx={{ p: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Test Cases
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {testCases.map((testCase, testCaseIndex) => (
              <React.Fragment key={testCaseIndex}>
                {testCase.testCaseSentences.map((sentence, sentenceIndex) => (
                  <Tooltip
                    key={`${testCaseIndex}-${sentenceIndex}`}
                    title={<Typography>{sentence}</Typography>}
                    arrow
                  >
                    <Card
                      sx={{
                        p: 2,
                        boxShadow: 2,
                        borderRadius: 2,
                        "&:hover": {
                          boxShadow: 4,
                        },
                        cursor: "pointer",
                        backgroundColor: "#ffffff",
                        transition: "box-shadow 0.3s ease", // Smooth shadow transition
                      }}
                      onMouseEnter={() =>
                        setHoveredCard(`${testCaseIndex}-${sentenceIndex}`)
                      }
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Test Case {testCaseIndex + 1}.{sentenceIndex + 1}
                      </Typography>
                    </Card>
                  </Tooltip>
                ))}

                {/* Expected Output Image Section */}
                {testCase.expectedImage && (
                  <Grid
                    item
                    xs={12}
                    key={`${testCaseIndex}-image`}
                    sx={{ mt: 2 }}
                  >
                    <Card
                      variant="outlined"
                      sx={{ borderRadius: "12px", overflow: "hidden" }}
                    >
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          <strong>Expected Output Image:</strong>
                        </Typography>
                        <Zoom in={true}>
                          <CardMedia
                            component="img"
                            image={testCase.expectedImage}
                            alt="Expected Output"
                            sx={{
                              borderRadius: 2,
                              maxWidth: "100%",
                              maxHeight: 400,
                              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                              mt: 2,
                              cursor: "pointer",
                              transition: "transform 0.3s ease", // Image zoom effect
                              "&:hover": {
                                transform: "scale(1.05)", // Slight zoom on hover
                              },
                            }}
                            onClick={() =>
                              handleImageClick(testCase.expectedImage)
                            }
                          />
                        </Zoom>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <div>
      <CssBaseline />

      {/* Hamburger Menu Icon */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={toggleDrawer}
        sx={{ position: "auto", top: 16, left: 16, zIndex: 1300 }}
      >
        {drawerOpen ? null : <MenuIcon />}
      </IconButton>

      {/* Drawer for sidebar */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 300,
            backgroundColor: "rgba(255, 255, 255, 0.9)", // Make it slightly transparent
            backdropFilter: "blur(8px)", // Blur background behind the drawer
            borderRadius: "16px", // Floating edges
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)", // Stronger floating effect
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Full-size image modal */}
      <Dialog
        open={openImage}
        onClose={handleCloseImage}
        fullScreen={fullScreen}
        maxWidth="md"
        PaperProps={{
          style: { borderRadius: 10, overflow: "hidden" }, // Rounded corners for the modal
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Expected Output Image
          </Typography>
        </DialogTitle>
        <DialogContent>
          <img
            src={selectedImage}
            alt="Full View"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseImage}
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
