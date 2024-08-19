import React from "react";
import { Typography, LinearProgress, Box } from "@mui/material";

const TeacherPlayerLevelUp = ({ totalPoints }) => {
  const calculateLevel = (points) => {
    let level = 1;
    let pointsRequired = 2;
    while (points >= pointsRequired) {
      points -= pointsRequired;
      level += 1;
      pointsRequired = Math.floor(pointsRequired * 1.5); // Exponential growth in points required
    }
    return {
      level,
      pointsToNextLevel: pointsRequired - points,
      pointsRequired,
    };
  };

  const { level, pointsToNextLevel, pointsRequired } =
    calculateLevel(totalPoints);

  return (
    <Box textAlign="center" p={2} border={1} borderRadius={4} boxShadow={2}>
      <Typography variant="h5" gutterBottom>
        Player Level: {level}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Total Points: {totalPoints}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={((pointsRequired - pointsToNextLevel) / pointsRequired) * 100}
      />
      <Typography variant="body2" color="textSecondary">
        {pointsToNextLevel} points to next level
      </Typography>
    </Box>
  );
};

export default TeacherPlayerLevelUp;
