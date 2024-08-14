import React, { useState } from "react";
import { Typography, TextField, Button, List, ListItem, ListItemText } from "@mui/material";

const GoalSetting = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  const addGoal = () => {
    if (newGoal.trim() !== "") {
      setGoals([...goals, newGoal]);
      setNewGoal("");
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Learning Goals
      </Typography>
      <TextField
        label="Set a new goal"
        fullWidth
        value={newGoal}
        onChange={(e) => setNewGoal(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={addGoal} style={{ marginTop: "10px" }}>
        Add Goal
      </Button>
      <List>
        {goals.map((goal, index) => (
          <ListItem key={index}>
            <ListItemText primary={goal} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default GoalSetting;
