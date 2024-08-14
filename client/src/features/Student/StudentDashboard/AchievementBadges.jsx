import React from "react";
import { Typography, Grid } from "@mui/material";

const badges = [
  { title: "First Step", description: "Started the first lesson" },
  { title: "Quiz Master", description: "Scored 100% on a quiz" },
  { title: "Marathon Runner", description: "Spent 10 hours learning" }
];

const AchievementBadges = () => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Achievements
      </Typography>
      <Grid container spacing={2}>
        {badges.map((badge, index) => (
          <Grid item xs={4} key={index}>
            <div style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center" }}>
              <Typography variant="subtitle1">{badge.title}</Typography>
              <Typography variant="body2">{badge.description}</Typography>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default AchievementBadges;
