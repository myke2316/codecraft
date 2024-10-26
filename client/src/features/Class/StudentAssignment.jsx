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
  useMediaQuery,
} from "@mui/material";
import { CalendarToday, Description, Assignment } from "@mui/icons-material";
import dayjs from "dayjs";

function StudentAssignment() {
  const classId = useSelector((state) => state.class.class._id);
  const [fetchAssignmentByClassId, { isLoading }] = useFetchAssignmentByClassIdMutation();
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

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

  if (isLoading)
    return <Typography variant="h6">Loading assignments...</Typography>;

  return (
    <Box sx={{ padding: { xs: 2, sm: 3, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }}>
       <Typography
      variant={isMobile ? "h5" : isTablet ? "h4" : "h3"} // Adjust variant based on screen size
      align={isMobile ? "center" : "left"}
      gutterBottom
      sx={{
        mb: isMobile ? 2 : isTablet ? 3 : 4, // Margin adjustments for different screen sizes
        color: "text.primary",
        fontWeight: 600,
        fontSize: isMobile ? "1.2rem" : isTablet ? "1.5rem" : "2rem", // Font size control
      }}
    >
      Assignments
    </Typography>

      {assignments.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 3, sm: 4 },
            textAlign: "center",
            bgcolor: "#f5f5f5",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No assignments available for this class.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later or contact your instructor for more information.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {assignments.map((assignment) => (
            <Grid
              item
              xs={12}
              sm={isTablet ? 6 : 12}
              md={6}
              lg={4}
              key={assignment._id}
            >
              <Card
                variant="outlined"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.02)" },
                  boxShadow: 2,
                  borderRadius: 2,
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
                    <CalendarToday fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Due: {dayjs(assignment.dueDate).format("MMM DD, YYYY")}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <Description fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Created: {dayjs(assignment.createdAt).format("MMM DD, YYYY")}
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    <Chip
                      label={dayjs().isAfter(dayjs(assignment.dueDate)) ? "Due" : "Not Due"}
                      color={dayjs().isAfter(dayjs(assignment.dueDate)) ? "error" : "success"}
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>
                </CardContent>

                {assignment.imageUrl && (
                  <Box sx={{ p: 1, maxHeight: 150, overflow: "hidden" }}>
                    <Zoom>
                      <img
                        alt="Assignment"
                        src={assignment.imageUrl}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </Zoom>
                  </Box>
                )}

                <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewAssignment(assignment._id)}
                    sx={{ textTransform: "none", fontWeight: 500 }}
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
