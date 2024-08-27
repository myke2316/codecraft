import React from 'react';
import { List, ListItem, ListItemText, Divider, Typography, Box, Paper, Chip } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LockIcon from '@mui/icons-material/Lock';

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
        alignItems: 'flex-start', 
        padding: '20px',
        width: '100%',
        minHeight: 'auto', // Ensure the box occupies the majority of the viewport height
        backgroundColor: '#f0f2f5' // Light background for the whole section
      }}
    >
      <Paper elevation={4} sx={{ padding: '20px', width: '100%', maxWidth: '700px', borderRadius: 2 }}>
        <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>
          Activities for {selectedLesson?.title}
        </Typography>
        <Divider sx={{ marginBottom: '20px' }} />
        <List sx={{ padding: 0 }}>
          {selectedLesson?.activities.map(activity => {
            const activityProgress = lessonProgress?.activitiesProgress.find(ap => ap.activityId === activity._id);
            const isLocked = activityProgress?.locked;

            return (
              <Link 
                to={isLocked ? "#" : `/course/${courseId}/lesson/${lessonId}/activity/${activity._id}`} 
                key={activity._id} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ListItem 
                  button 
                  disabled={isLocked} 
                  sx={{
                    marginBottom: '15px',
                    padding: '15px',
                    borderRadius: '12px',
                    backgroundColor: isLocked ? '#f8d7da' : '#e3f2fd',
                    '&:hover': { backgroundColor: isLocked ? '#f8d7da' : '#bbdefb' },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: isLocked ? 'none' : '0 3px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  <ListItemText 
                    primary={activity.title} 
                    sx={{ 
                      color: isLocked ? '#a1a1a1' : '#333', 
                      fontWeight: isLocked ? 'normal' : 'bold' 
                    }}
                  />
                  {isLocked && <Chip icon={<LockIcon />} label="Locked" sx={{ color: '#721c24', bgcolor: '#f8d7da' }} />}
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
