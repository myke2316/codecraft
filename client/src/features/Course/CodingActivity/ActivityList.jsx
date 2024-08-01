import React from 'react';
import { List, ListItem, ListItemText, Divider, Typography, Box, Paper } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

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
        alignItems: 'flex-start', // Align to the start of the container
        padding: '20px'
      }}
    >
      <Paper elevation={3} sx={{ padding: '20px', width: '100%', maxWidth: '600px', backgroundColor: '#fff' }}>
        <Typography variant="h5" sx={{ marginBottom: '15px', fontWeight: 'bold' }}>
          Activities for {selectedLesson?.title}
        </Typography>
        <Divider sx={{ marginBottom: '15px' }} />
        <List>
          {selectedLesson?.activities.map(activity => {
            const activityProgress = lessonProgress?.activitiesProgress.find(ap => ap.activityId === activity._id);
            const isLocked = activityProgress?.locked;

            return (
              <Link 
                to={isLocked ? "#" : `/course/${courseId}/lesson/${lessonId}/activity/${activity._id}`} 
                key={activity._id} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ListItem button disabled={isLocked} sx={{ marginBottom: '10px', borderRadius: '8px', backgroundColor: isLocked ? '#f5f5f5' : '#e8f5e9', '&:hover': { backgroundColor: '#c8e6c9' } }}>
                  <ListItemText 
                    primary={activity.title} 
                    sx={{ color: isLocked ? '#a1a1a1' : '#000' }}
                  />
                </ListItem>
              </Link>
            );
          })}
        </List>
        <Divider sx={{ marginTop: '15px' }} />
      </Paper>
    </Box>
  );
};

export default ActivityList;
