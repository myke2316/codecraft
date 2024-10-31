import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
  CircularProgress,
  Alert,
  AccordionDetails,
  AccordionSummary,
  Accordion,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import {
  ArrowBack,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ExpandMore,
} from "@mui/icons-material";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { BACKEND_URL, BASE_URLS } from "../../constants";
import { useFetchAssignmentByIdMutation } from "./assignmentService";
import { useGetAssignmentByAssignmentIdQuery } from "../Class/submissionAssignmentService";
import { useTheme } from "@emotion/react";

function TeacherViewAssignment() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { assignmentId, classId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const submissionsPerPage = 7;
  const navigate = useNavigate();

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

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentById(assignmentId)
        .unwrap()
        .then((data) => setSelectedAssignment(data))
        .catch((err) => console.error("Error fetching submissions:", err));
    }
  }, [assignmentId, fetchAssignmentById]);

  useEffect(() => {
    if (submissionsData && Array.isArray(submissionsData.submissions)) {
      setSubmissions(submissionsData.submissions);
    }
  }, [submissionsData]);

  const handleViewSubmission = (submissionId, studentId) => {
    navigate(`submission/${submissionId}/student/${studentId}`);
  };

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
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (assignmentLoading || submissionsLoading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (assignmentError || submissionsError) {
    return (
      <Alert severity="error" className="m-4">
        Error fetching assignment details:{" "}
        {assignmentFetchError?.data?.message || "Unknown error"}
      </Alert>
    );
  }

  const paginatedSubmissions = submissions.slice(
    (page - 1) * submissionsPerPage,
    page * submissionsPerPage
  );

  return selectedAssignment ? (
    <Container maxWidth="xxl" className="mt-8 mb-8">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{
          color: "gray", // Lighter color for a subtle look
          textTransform: "none", // Remove uppercase to make it less prominent
          fontSize: "0.875rem", // Smaller font size
          padding: "4px 8px", // Compact padding
          minWidth: "unset", // Remove minimum width to keep it small
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)", // Light hover effect
          },
        }}
      >
        Back to Assignments
      </Button>
      <Grid container spacing={4}>
      <Grid item xs={12} md={12}>
  <Card variant="outlined" className="p-6">
    <Typography
      variant="h4"
      gutterBottom
      className="font-bold text-primary"
      sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }} // Font size adjusts for smaller screens
    >
      {selectedAssignment.title}
    </Typography>
    <Divider className="my-4" />
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography
          variant="h6"
          className="font-semibold"
          sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} // Adjust for smaller screens
        >
          Description
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          variant="body1"
          className="text-gray-700"
          sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
        >
          {selectedAssignment.description}
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography
          variant="h6"
          className="font-semibold"
          sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
        >
          Instructions
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          variant="body1"
          className="text-gray-700"
          sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
        >
          {selectedAssignment.instructions}
        </Typography>
      </AccordionDetails>
    </Accordion>
    <Box
      className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mt-4"
      sx={{
        flexDirection: { xs: 'column', sm: 'row' }, // Stack on smaller screens
        textAlign: { xs: 'center', sm: 'left' },
        gap: { xs: '8px', sm: '0' }
      }}
    >
      <Typography
        variant="subtitle1"
        className="font-semibold"
        sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
      >
        Due Date: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
      </Typography>
      <Typography
        variant="subtitle1"
        className="font-semibold"
        sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
      >
        Created: {new Date(selectedAssignment.createdAt).toLocaleDateString()}
      </Typography>
    </Box>
  </Card>
  {selectedAssignment.expectedOutputImage && (
    <Card variant="outlined" className="mt-8 p-6">
      <Typography
        variant="h6"
        gutterBottom
        className="font-semibold"
        sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
      >
        Expected Output Image
      </Typography>
      <Zoom>
        <CardMedia
          component="img"
          image={`${BACKEND_URL}/api/assignment/images/${selectedAssignment.expectedOutputImage}`}
          alt="Expected Output"
          className="rounded-lg max-w-full h-auto shadow-lg mt-4"
        />
      </Zoom>
    </Card>
  )}
</Grid>

        <Grid item xs={12} md={12}>
          <Card variant="outlined" className="p-6">
            <Typography variant="h5" gutterBottom className="font-semibold">
              Student Submissions
            </Typography>
            <Box
  className="flex flex-col sm:flex-row justify-between items-center mb-4"
  sx={{
    gap: { xs: '12px', sm: '16px' }, // Add gap between items
    alignItems: 'center', // Aligns the items vertically in smaller screens
  }}
>
  <FormControl
    className="w-full sm:w-auto"
    sx={{
      mb: { xs: '8px', sm: 0 }, // Adds margin at the bottom on small screens
      width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto on larger
    }}
  >
    <InputLabel id="sort-label">Sort by Date</InputLabel>
    <Select
      labelId="sort-label"
      value={sortDirection}
      onChange={handleSortChange}
      label="Sort by Date"
      sx={{
        minWidth: { xs: '100%', sm: '200px' }, // Ensure Select has minimum width
      }}
    >
      <MenuItem value="asc">Oldest First</MenuItem>
      <MenuItem value="desc">Newest First</MenuItem>
    </Select>
  </FormControl>

  <FormControl
    className="w-full sm:w-auto"
    sx={{
      width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto on larger
    }}
  >
    <InputLabel>Status</InputLabel>
    <Select
      value={filterStatus}
      onChange={handleFilterChange}
      label="Status"
      sx={{
        minWidth: { xs: '100%', sm: '200px' }, // Ensure Select has minimum width
      }}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      <MenuItem value="graded">Graded</MenuItem>
      <MenuItem value="pending">Pending</MenuItem>
    </Select>
  </FormControl>
</Box>
            {paginatedSubmissions.length > 0 ? (
              <>
                <TableContainer component={Paper} className="mb-4">
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
                          <strong>Status</strong>
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
                          <TableCell>{submission.status}</TableCell>
                          <TableCell>
                            <Tooltip
                              title={
                                submission.graded
                                  ? "Edit Submission"
                                  : "View Submission"
                              }
                            >
                              <IconButton
                                onClick={() =>
                                  handleViewSubmission(
                                    submission._id,
                                    submission.studentId._id
                                  )
                                }
                              >
                                {submission.graded ? (
                                  <EditIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
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
                  className="flex justify-center"
                />
              </>
            ) : (
              <Typography variant="h6" align="center" className="mt-4">
                No submissions available.
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  ) : (
    <Alert severity="warning" className="m-4">
      Assignment not found
    </Alert>
  );
}

export default TeacherViewAssignment;
