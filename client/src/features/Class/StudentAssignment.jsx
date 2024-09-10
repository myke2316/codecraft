import React, { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useFetchAssignmentByClassIdMutation } from "../Teacher/assignmentService"; // Adjust the path as per your project structure
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Grid,
  Box,
  Paper,
} from "@mui/material";
import { CalendarToday, Description } from "@mui/icons-material";

function StudentAssignment() {
  const classId = useSelector((state) => state.class.class._id);
  const [fetchAssignmentByClassId, { isLoading, isError }] = useFetchAssignmentByClassIdMutation();
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    if (classId) {
      fetchAssignmentByClassId(classId)
        .unwrap()
        .then((response) => {
          setAssignments(response); // Assuming the response contains the list of assignments
        })
        .catch((error) => {
          console.error("Failed to fetch assignments:", error);
        });
    }
  }, [classId, fetchAssignmentByClassId]);

  // Function to handle redirection to the assignment detail view
  const handleViewAssignment = (assignmentId) => {
    navigate(`${assignmentId}/view`);
  };

  if (isLoading) return <Typography variant="h6">Loading assignments...</Typography>;


  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Assignments
      </Typography>
      {assignments.length === 0 ? (
        <Paper sx={{ padding: 3, textAlign: "center", backgroundColor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom>
            No assignments available for this class.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            It looks like there are no assignments currently assigned to this class. Please check back later or contact your instructor for more information.
          </Typography>
      
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {assignments.map((assignment) => (
            <Grid item xs={12} sm={6} md={4} key={assignment._id}>
              <Card variant="outlined" sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {assignment.title}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Due Date: {new Date(assignment.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Description fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Created At: {new Date(assignment.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end" }}>
                  <Button size="small" color="primary" onClick={() => handleViewAssignment(assignment._id)}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default StudentAssignment;
