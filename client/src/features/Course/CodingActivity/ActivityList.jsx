import React from 'react';
import { List, ListItem, ListItemText, Divider, Typography, Box, Paper, Chip, Avatar } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const ActivityList = () => {
  const { lessonId, courseId } = useParams();
  const userProgress = useSelector(state => state.studentProgress.userProgress);
  const courseData = useSelector(state => state.course.courseData);

  // Find the specific course and lesson
  const selectedCourse = courseData.find(c => c._id === courseId);
  const selectedLesson = selectedCourse?.lessons.find(lesson => lesson._id === lessonId);

  // Find the progress for the selected course and lesson
  const courseProgress = userProgress.coursesProgress.find(cp => cp.courseId === courseId);
  const lessonProgress = courseProgress?.lessonsProgress.find(lp => lp.lessonId === lessonId);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center', // Centered alignment
        padding: '40px',
        width: '100%',
        minHeight: '100vh', // Ensure the box occupies the viewport height
        backgroundColor: '#f4f6f9', // Light background for the whole section
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: '30px',
          width: '100%',
          maxWidth: '800px',
          borderRadius: 3,
          textAlign: 'center', // Center the text within the card
        }}
      >
        {/* Lesson Title */}
        <Typography variant="h5" sx={{ marginBottom: '30px', fontWeight: 'bold', color: '#1a237e' }}>
          Activities for {selectedLesson?.title}
        </Typography>
        <Divider sx={{ marginBottom: '20px' }} />

        {/* Activities List */}
        <List sx={{ padding: 0 }}>
          {selectedLesson?.activities.map(activity => {
            const activityProgress = lessonProgress?.activitiesProgress.find(ap => ap.activityId === activity._id);
            const isLocked = activityProgress?.locked;
            const dateFinished = activityProgress?.dateFinished;

            const activityStatusIcon = () => {
              if (isLocked) {
                return (
                  <Chip
                    icon={<LockIcon />}
                    label="Locked"
                    sx={{ color: '#721c24', bgcolor: '#f8d7da', fontSize: '0.875rem' }}
                  />
                );
              } else if (dateFinished) {
                return (
                  <Chip
                    icon={<CheckCircleIcon sx={{ color: 'green' }} />}
                    label="Completed"
                    sx={{ fontSize: '0.875rem', color: 'green' }}
                  />
                );
              } else {
                return (
                  <Chip
                    icon={<HourglassEmptyIcon sx={{ color: '#ff9800' }} />}
                    label="In Progress"
                    sx={{ fontSize: '0.875rem', color: '#ff9800' }}
                  />
                );
              }
            };

            return (
              <Link
                to={isLocked ? '#' : `/course/${courseId}/lesson/${lessonId}/activity/${activity._id}`}
                key={activity._id}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {/* Activity Item */}
                <ListItem
                  button
                  disabled={isLocked}
                  sx={{
                    marginBottom: '15px',
                    padding: '20px',
                    borderRadius: '15px',
                    backgroundColor: isLocked ? '#f8d7da' : '#e3f2fd',
                    '&:hover': { backgroundColor: isLocked ? '#f8d7da' : '#bbdefb' },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: isLocked ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                  }}
                >
                  {/* Activity Title */}
                  <ListItemText
                    primary={activity.title}
                    sx={{
                      color: isLocked ? '#a1a1a1' : '#0d47a1',
                      fontWeight: isLocked ? 'normal' : 'bold',
                      fontSize: '1.1rem',
                    }}
                  />
                  {/* Activity Status Icon */}
                  {activityStatusIcon()}
                </ListItem>
              </Link>
            );
          })}
        </List>

        <Divider sx={{ marginTop: '20px' }} />
      </Paper>
    </Box>
  );
};

export default ActivityList;
