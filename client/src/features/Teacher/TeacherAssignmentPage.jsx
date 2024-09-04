import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import AssignmentTable from "./AssignmentTable"; // Ensure the path is correct
import TeacherAssignment from "./TeacherAssignment"; // Ensure the path is correct
import { useFetchAssignmentByClassIdMutation } from "./assignmentService";
import { useParams } from "react-router";

function TeacherAssignmentsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { classId } = useParams();

  const handleCreateClick = () => {
    setDialogOpen(true);
  };

  const [fetchAssignments] = useFetchAssignmentByClassIdMutation();
  const handleClose = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true);
      try {
        const response = await fetchAssignments(classId).unwrap();
        setAssignments(response);
        console.log(response);
      } catch (err) {
        setError(err.message || "Failed to fetch assignments");
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [classId, fetchAssignments]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Assignments
      </Typography>

      {/* Display Images Above Assignment Table */}
      <Grid container spacing={2} marginBottom={2}>
        {assignments.map((assignment) =>
          assignment.expectedOutputImage ? (
            <Grid item key={assignment._id} xs={12} sm={6} md={4}>
              <Paper elevation={3} style={{ padding: 16 }}>
                <Typography variant="h6" gutterBottom>
                  {assignment.title}
                </Typography>
                <img
                  src={`http://localhost:8000/api/assignment/images/${assignment.expectedOutputImage}`}
                  alt={assignment.title}
                  style={{ width: '100%', height: 'auto' }}
                />
              </Paper>
            </Grid>
          ) : null
        )}
      </Grid>

      {/* Assignment Table */}
      <AssignmentTable
        setDialogOpen={setDialogOpen}
        onCreate={handleCreateClick}
        assignments={assignments}
      />

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create Assignment</DialogTitle>
        <DialogContent>
          <TeacherAssignment setDialogOpen={setDialogOpen} />
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
