import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Typography,
  Paper,
} from "@mui/material";
import AssignmentTable from "./AssignmentTable"; // Ensure the path is correct
import TeacherAssignment from "./TeacherAssignment"; // Ensure the path is correct

function TeacherAssignmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateClick = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };
  const assignments = [];
  return (
    <Container>
      <AssignmentTable onCreate={handleCreateClick} assignments={assignments} />
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create Assignment</DialogTitle>
        <DialogContent>
          <TeacherAssignment />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TeacherAssignmentsPage;
