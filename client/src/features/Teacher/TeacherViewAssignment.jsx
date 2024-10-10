import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Grid,
  Container,
  CardMedia,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  ButtonGroup,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Import EditIcon
import { useFetchAssignmentByIdMutation } from "./assignmentService";
import { useGetAssignmentByAssignmentIdQuery } from "../Class/submissionAssignmentService";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { BACKEND_URL, BASE_URLS } from "../../constants";

function TeacherViewAssignment() {
  const { assignmentId, classId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [sortDirection, setSortDirection] = useState("desc"); // Default sorting by descending date
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const submissionsPerPage = 7;
  const navigate = useNavigate();
  function handleViewSubmission(submissionId, studentId) {
    navigate(`submission/${submissionId}/student/${studentId}`);
  }

  const [
    fetchAssignmentById,
    {
      isLoading: assignmentLoading,
      isError: assignmentError,
      error: assignmentFetchError,
    },
  ] = useFetchAssignmentByIdMutation();

  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    isError: submissionsError,
  } = useGetAssignmentByAssignmentIdQuery(assignmentId);
  // console.log(submissionsData);
  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentById(assignmentId)
        .unwrap()
        .then((data) => {
          setSelectedAssignment(data);
        })
        .catch((err) => console.error("Error fetching submissions:", err));
    }
  }, [assignmentId, fetchAssignmentById]);

  useEffect(() => {
    if (submissionsData && Array.isArray(submissionsData.submissions)) {
      setSubmissions(submissionsData.submissions);
    }
  }, [submissionsData]);

  const handleSortChange = (event) => {
    const direction = event.target.value;
    setSortDirection(direction);

    const sortedSubmissions = [...submissions].sort((a, b) => {
      const dateA = new Date(a.submittedAt);
      const dateB = new Date(b.submittedAt);
      return direction === "asc" ? dateA - dateB : dateB - dateA;
    });
    setSubmissions(sortedSubmissions);
  };

  const handleFilterChange = (event) => {
    const status = event.target.value;
    setFilterStatus(status);

    let filteredSubmissions = submissionsData?.submissions || [];

    if (status) {
      filteredSubmissions = filteredSubmissions.filter(
        (submission) =>
          (status === "graded" && submission.graded) ||
          (status === "pending" && !submission.graded)
      );
    }

    setSubmissions(filteredSubmissions);
    setPage(1); // Reset to the first page when applying filters
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (assignmentLoading || submissionsLoading) {
    return (
      <Typography variant="h6">
        Loading assignment details and submissions...
      </Typography>
    );
  }

  if (assignmentError || submissionsError) {
    return (
      <Typography variant="h6" color="error">
        Error fetching assignment details:{" "}
        {assignmentFetchError?.data?.message || "Unknown error"}
      </Typography>
    );
  }

  // Pagination logic
  const paginatedSubmissions = submissions.slice(
    (page - 1) * submissionsPerPage,
    page * submissionsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
      <Grid container spacing={4}>
        {/* Left Side: Assignment Details */}
      
        <Grid item xs={12} md={6}>
       
          {selectedAssignment && (
            <Card variant="outlined" sx={{ p: 3 }}> <Button onClick={() => navigate(-1)}>Back</Button>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {selectedAssignment.title}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Description:</strong>
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedAssignment.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Instructions:</strong>
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedAssignment.instructions}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Due Date:</strong>{" "}
                  {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Created At:</strong>{" "}
                  {new Date(selectedAssignment.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>

              {selectedAssignment.expectedOutputImage && (
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Expected Output Image:</strong>
                  </Typography>
                  <Zoom>
                    <CardMedia
                      component="img"
                      image={`${BACKEND_URL}/api/assignment/images/${selectedAssignment.expectedOutputImage}`}
                      alt="Expected Output"
                      sx={{
                        borderRadius: 2,
                        maxWidth: "100%",
                        maxHeight: 400,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        mt: 2,
                      }}
                    />
                  </Zoom>
                </CardContent>
              )}
            </Card>
          )}
        </Grid>

        {/* Right Side: Submissions Section */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Student Submissions
            </Typography>

            {/* Sort and Filter Section */}
            <Box
              sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}
            >
              <Box>
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel id="sort-label">Sort by Date</InputLabel>
                  <Select
                    labelId="sort-label"
                    value={sortDirection}
                    onChange={handleSortChange}
                    label="Sort by Date"
                  >
                    <MenuItem value="asc">Oldest First</MenuItem>
                    <MenuItem value="desc">Newest First</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    label="Status"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="graded">Graded</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {paginatedSubmissions.length > 0 ? (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Student</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Submission Date</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Grade</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Status</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Feedback</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Actions</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSubmissions.map((submission) => (
                        <TableRow key={submission._id}>
                          <TableCell>{submission.studentId.username}</TableCell>
                          <TableCell>
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{submission.grade || "N/A"}</TableCell>
                          <TableCell>{submission.status}</TableCell>
                          <TableCell>
                            {submission.feedback || "No feedback"}
                          </TableCell>
                          <TableCell>
  <Tooltip title={submission.graded ? "Edit Submission" : "View Submission"}>
    <IconButton
      component="a"
      onClick={() =>
        handleViewSubmission(submission._id, submission.studentId._id)
      }
      target="_blank"
      rel="noopener noreferrer"
      download
    >
      {submission.graded ? <EditIcon /> : <VisibilityIcon />}
    </IconButton>
  </Tooltip>
</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Pagination
                  count={Math.ceil(submissions.length / submissionsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                />
              </>
            ) : (
              <Typography variant="h6" align="center" sx={{ mt: 3 }}>
                No submissions available.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TeacherViewAssignment;
