import React, { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useFetchAssignmentByClassIdMutation } from "../Teacher/assignmentService";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Grid,
  Box,
  Paper,
  Chip,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { CalendarToday, Description, Assignment } from "@mui/icons-material";

function StudentAssignment() {
  const classId = useSelector((state) => state.class.class._id);
  const [fetchAssignmentByClassId, { isLoading }] = useFetchAssignmentByClassIdMutation();
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    if (classId) {
      fetchAssignmentByClassId(classId)
        .unwrap()
        .then((response) => {
          setAssignments(response);
        })
        .catch((error) => {
          console.error("Failed to fetch assignments:", error);
        });
    }
  }, [classId, fetchAssignmentByClassId]);

  const handleViewAssignment = (assignmentId) => {
    navigate(`${assignmentId}/view`);
  };

  if (isLoading) return <Typography variant="h6">Loading assignments...</Typography>;

  return (
    <Box sx={{ padding: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom align={isMobile ? "center" : "left"} sx={{ mb: 3 }}>
        Student Assignments
      </Typography>

      {assignments.length === 0 ? (
        <Paper sx={{ padding: { xs: 2, sm: 3 }, textAlign: "center", backgroundColor: "#f5f5f5" }}>
          <Typography variant="h6" gutterBottom>
            No assignments available for this class.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            It looks like there are no assignments currently assigned to this class. Please check back later or contact your instructor for more information.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {assignments.map((assignment) => (
            <Grid item xs={12} sm={isTablet ? 6 : 12} md={6} lg={4} key={assignment._id}>
              <Card
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.02)" },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Assignment fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" noWrap>
                      {assignment.title}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <Description fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Created: {new Date(assignment.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    <Chip
                      label="Pending"
                      color="warning"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>
                </CardContent>

                {assignment.imageUrl && (
                  <Box sx={{ p: 1, maxHeight: 150, overflow: 'hidden' }}>
                    <Zoom>
                      <img
                        alt="Assignment"
                        src={assignment.imageUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                      />
                    </Zoom>
                  </Box>
                )}

                <CardActions sx={{ justifyContent: "flex-end", p: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewAssignment(assignment._id)}
                  >
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