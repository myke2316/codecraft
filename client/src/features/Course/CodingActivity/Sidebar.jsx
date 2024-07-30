import React from 'react';
import { List, ListItem, ListItemText, Divider, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Sidebar = ({ activities, selectedActivity }) => {
  return (
    <div style={{ width: '300px', padding: '10px', backgroundColor: '#f4f4f4', height: '100vh' }}>
      <h2>Lesson 1 Activities:</h2>
      <List>
        {activities.map(activity => (
          <Link to={`/course/activity/${activity.activityId}`} key={activity.activityId} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem button selected={selectedActivity?.activityId === activity.activityId}>
              <ListItemText primary={activity.title} />
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      {selectedActivity && (
        <Box sx={{ padding: '10px' }}>
          <Typography variant="h6">Details</Typography>
          <Typography variant="body2" sx={{ marginBottom: '10px' }}>
            <strong>Description:</strong> {selectedActivity.description}
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: '10px' }}>
            <strong>Problem Statement:</strong> {selectedActivity.problemStatement}
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: '10px' }}>
            <strong>Language:</strong> {selectedActivity.language}
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: '10px' }}>
            <strong>Difficulty:</strong> {selectedActivity.difficulty}
          </Typography>
        </Box>
      )}
    </div>
  );
};

export default Sidebar;
