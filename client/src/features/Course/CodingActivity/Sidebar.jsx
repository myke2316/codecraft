import React from 'react';
import { List, ListItem, ListItemText, Divider, Typography, Box } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = ({ courseId, lessonId, userProgress }) => {
  const course = useSelector(state => state.course.courseData);
  
  // Find the specific course and lesson
  const selectedCourse = course.find(c => c._id === courseId);
  const selectedLesson = selectedCourse?.lessons.find(lesson => lesson._id === lessonId);
  
  // Find the progress for the selected course and lesson
  const courseProgress = userProgress.coursesProgress.find(cp => cp.courseId === courseId);
  const lessonProgress = courseProgress?.lessonsProgress.find(lp => lp.lessonId === lessonId);

  return (
    <div style={{ width: '300px', padding: '10px', backgroundColor: '#f4f4f4', height: '100vh' }}>
      <h2>{selectedLesson?.title} Activities:</h2>
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
              <ListItem button selected={activity._id === useParams().activityId} disabled={isLocked}>
                <ListItemText primary={activity.title} />
              </ListItem>
            </Link>
          );
        })}
      </List>
      <Divider />
      {selectedLesson && (
        <Box sx={{ padding: '10px' }}>
          <Typography variant="h6">Lesson Details</Typography>
          <Typography variant="body2" sx={{ marginBottom: '10px' }}>
            <strong>Title:</strong> {selectedLesson.title}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default Sidebar;
