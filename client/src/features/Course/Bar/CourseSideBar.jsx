import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Drawer,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion } from "framer-motion";

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),  // Added padding for each list item
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)", // Subtle shadow
  transition: "background-color 0.3s ease, transform 0.2s ease",
  '&:hover': {
    backgroundColor: "	#9683ec",
    transform: "translateY(-2px)", // Hover effect
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // Increased shadow on hover
  },
}));

const ProgressBar = styled(Box)(({ theme, progress }) => ({
  height: 4,
  width: '100%',
  backgroundColor: theme.palette.grey[200],
  position: 'relative',
  borderRadius: 2,
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${progress}%`,
    backgroundColor: "#7e21d4",
    transition: 'width 0.5s ease-in-out',
  },
}));

function CourseSidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const courses = useSelector((state) => state.course.courseData);
  const userProgress = useSelector(state => state.studentProgress.userProgress);
  const user = useSelector((state) => state.user.userDetails);
  const classInfo = useSelector(state => state.class.class);
  
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const courseIdFromUrl = pathSegments[2];
    const lessonIdFromUrl = pathSegments[4];

    if (courseIdFromUrl && lessonIdFromUrl) {
      setActiveCourseId(courseIdFromUrl);
      setActiveLessonId(lessonIdFromUrl);
    }
  }, [location]);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleCourseClick = (courseId) => {
    setActiveCourseId(courseId);
    setActiveLessonId(null);
  };

  const handleLessonClick = (courseId, lessonId) => {
    navigate(`/course/${courseId}/lesson/${lessonId}`);
  };

  const calculateProgress = (courseProgress) => {
    let totalItems = 0;
    let completedItems = 0;
  
    // Loop through each lesson in the course
    courseProgress.lessonsProgress.forEach((lessonProgress) => {
      const totalDocuments = lessonProgress.documentsProgress.length;
      const completedDocuments = lessonProgress.documentsProgress.filter(
        (document) => document.dateFinished !== null
      ).length;
  
      const totalQuizzes = lessonProgress.quizzesProgress.length;
      const completedQuizzes = lessonProgress.quizzesProgress.filter(
        (quiz) => quiz.dateFinished !== null
      ).length;
  
      const totalActivities = lessonProgress.activitiesProgress.length;
      const completedActivities = lessonProgress.activitiesProgress.filter(
        (activity) => activity.dateFinished !== null
      ).length;
  
      // Add the totals and completed items for the lesson
      totalItems += totalDocuments + totalQuizzes + totalActivities;
      completedItems += completedDocuments + completedQuizzes + completedActivities;
    });
  
    // Avoid division by zero if there are no items in the course
    if (totalItems === 0) {
      return 0;
    }
  
    // Calculate progress as a percentage
    return (completedItems / totalItems) * 100;
  };
  


  const sidebarContent = (
    <Box 
      sx={{ 
        width: 300, 
        height: '100%', 
        overflowY: 'auto', 
        bgcolor: 'background.paper',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)', // Sidebar shadow for separation
        p: 2, // Padding around the sidebar content
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/studentClass/${classInfo._id}/classHome`)}
            sx={{ mb: 2, width: '100%', justifyContent: 'flex-start' }}
          >
            Back to Class Home
          </Button>
        </motion.div>
      </Box>
      <List>
        {courses.map((course) => {
          const courseProgress = userProgress.coursesProgress.find(
            (cp) => cp.courseId.toString() === course._id.toString()
          );
          if (!courseProgress) return null;

          const progress = calculateProgress(courseProgress);
            console.log(course)
          return (
            <React.Fragment key={course._id}>
              <StyledListItem
                button
                onClick={() => handleCourseClick(course._id)}
                selected={activeCourseId === course._id}
                component={motion.li}
                initial={{ opacity: 0, translateX: -50 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <ListItemIcon>
                  <FolderIcon color={activeCourseId === course._id ? "primary" : "inherit"} />
                </ListItemIcon>
                <ListItemText 
                  primary={course.title}
                  secondary={<ProgressBar progress={progress} />}
                />
                {progress === 100 && <CheckCircleIcon color="success" sx={{ ml: 1 }} />}
              </StyledListItem>
              {activeCourseId === course._id && (
                <List component="div" disablePadding>
                  {course.lessons.map((lesson) => {
                    const lessonProgress = courseProgress.lessonsProgress.find(
                      (lp) => lp.lessonId.toString() === lesson._id.toString()
                    );
                    if (!lessonProgress) return null;

                    const isLessonUnlocked = !lessonProgress.locked;
                    const isLessonCompleted = lessonProgress.dateFinished !== null && lessonProgress.dateFinished !== undefined;

                    return (
                      <StyledListItem
                        key={lesson._id}
                        button
                        sx={{ pl: 4 }}
                        onClick={() => isLessonUnlocked && handleLessonClick(course._id, lesson._id)}
                        selected={activeLessonId === lesson._id}
                        disabled={!isLessonUnlocked}
                        component={motion.li}
                        initial={{ opacity: 0, translateX: 50 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      >
                        <ListItemIcon>
                          {isLessonUnlocked ? (
                            <DescriptionIcon color={activeLessonId === lesson._id ? "primary" : "inherit"} />
                          ) : (
                            <LockIcon color="disabled" />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={lesson.title} />
                        {isLessonCompleted && <CheckCircleIcon color="success" sx={{ ml: 1 }} />}
                      </StyledListItem>
                    );
                  })}
                </List>
              )}
            </React.Fragment>
          );
        })}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box textAlign="center" mt={2} mb={2}>
        <motion.div whileHover={{ scale: 1.05 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: "50px" }}
            disabled={!courses.every((course) => {
              const courseProgress = userProgress.coursesProgress.find(
                (cp) => cp.courseId.toString() === course._id.toString()
              );
              return courseProgress?.dateFinished !== undefined && courseProgress?.dateFinished !== null;
            })}
            onClick={() => navigate(`/course/${user._id}/certification`)}
          >
            🎉 Complete Course
          </Button>
        </motion.div>
      </Box>
    </Box>
  );

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={toggleDrawer(true)}
        sx={{ mr: 2, display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300 },
        }}
      >
        {sidebarContent}
      </Drawer>
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 300, boxSizing: 'border-box' },
        }}
      >
        {sidebarContent}
      </Box>
    </>
  );
}

export default CourseSidebar;
