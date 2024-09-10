import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Typography,
  IconButton,
  Grid,
  Paper,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh"; // Import the Refresh icon
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

  const [fetchAssignments] = useFetchAssignmentByClassIdMutation();

  const handleCreateClick = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    refreshAssignments(); // Refresh assignments data when the dialog is closed
  };

  const refreshAssignments = async () => {
    setLoading(true);
    try {
      // Assuming fetchAssignments is a mutation function
      const response = await fetchAssignments(classId).unwrap();

      if (response && Array.isArray(response)) {
        // If the response is an array, set it as assignments
        setAssignments(response);
      } else {
        // Handle cases where the response is not as expected

        setAssignments([]); // Set an empty array or handle as appropriate
      }

      console.log("Fetched assignments:", response);
    } catch (err) {
      // Catch and handle errors
      setError(err.message || "Failed to fetch assignments");
      setAssignments([]);
      console.error("Fetch assignments error:", err);
    } finally {
      // Ensure loading state is turned off
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAssignments(); // Load assignments on component mount
  }, [classId, fetchAssignments]);

  return (
    <Container>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        marginBottom={2}
      >
        <Typography variant="h4" gutterBottom>
          Assignments
        </Typography>
        <IconButton onClick={refreshAssignments} color="primary">
          <RefreshIcon />
        </IconButton>
      </Grid>

      {/* Display Images Above Assignment Table */}
      {/* <Grid container spacing={2} marginBottom={2}>
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
      </Grid> */}

      {/* Assignment Table */}
      <AssignmentTable
        setDialogOpen={setDialogOpen}
        onCreate={handleCreateClick}
        assignments={assignments}
        refreshAssignments={refreshAssignments}
      />

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create Assignment</DialogTitle>
        <DialogContent>
          <TeacherAssignment
            setDialogOpen={setDialogOpen}
            refreshAssignments={refreshAssignments}
          />
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
