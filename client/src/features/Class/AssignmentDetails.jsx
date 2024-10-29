import React, { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
  FormControl,
  FormHelperText,
  TextField,
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
} from "@mui/material";
import { ArrowBack, CloudUpload, Delete, Download, ExpandMore } from "@mui/icons-material";
import { BACKEND_URL, BASE_URLS } from "../../constants";
import { useFetchAssignmentByIdMutation } from "../Teacher/assignmentService";
import {
  useFetchSubmissionByAssignmentAndStudentIdQuery,
  useSubmitAssignmentMutation,
  useDeleteSubmissionMutation,
} from "./submissionAssignmentService";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTheme } from "@emotion/react";

function AssignmentDetails() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { assignmentId } = useParams();
  const classId = useSelector((state) => state.class.class._id);
  const studentId = useSelector((state) => state.user.userDetails._id);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedFileName, setSubmittedFileName] = useState(null);
  const [gradingStatus, setGradingStatus] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const navigate = useNavigate();

  const [fetchAssignmentById, { isLoading, isError, error }] = useFetchAssignmentByIdMutation();
  const [submitAssignment,{isLoading:isLoadingAssignment}] = useSubmitAssignmentMutation();
  const [deleteSubmission] = useDeleteSubmissionMutation();

  const {
    data: submissionData,
    isLoading: submissionLoading,
    refetch,
  } = useFetchSubmissionByAssignmentAndStudentIdQuery({
    assignmentId,
    studentId,
  });

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentById(assignmentId)
        .unwrap()
        .then((data) => setSelectedAssignment(data))
        .catch((err) => console.error("Error fetching assignment:", err));
    }
  }, [assignmentId, fetchAssignmentById]);

  useEffect(() => {
    if (submissionData) {
      setHasSubmitted(true);
      setSubmittedFileName(submissionData.file?.filename);
      setGradingStatus(submissionData.submission.status || "Not Graded");
      setFeedback(submissionData.submission.feedback || "");
      setScore(submissionData.submission.grade || null);
    }
  }, [submissionData]);

  const handleZipFileChange = (e) => {
    setZipFile(e.target.files[0]);
    setSubmissionLink("");
  };

  const handleSubmitAssignment = async (teacherId) => {
    try {
      if (!zipFile) {
        setErrorMessage("Zip file is required.");
        return;
      }

      setErrorMessage("");

      const formData = new FormData();
      formData.append("zipFile", zipFile);
      formData.append("assignmentId", assignmentId);
      formData.append("classId", classId);
      formData.append("studentId", studentId);
      formData.append("teacherId", teacherId);

      const response = await submitAssignment(formData).unwrap();
      console.log("Submission successful:", response);
      refetch();
    } catch (error) {
      setErrorMessage("Failed to submit assignment.");
      console.error("Submission error:", error);
    }
  };
  const submissionId = submissionData?.submission._id;

  const handleDeleteSubmission = async () => {
    try {
      await deleteSubmission(submissionId).unwrap();
      setHasSubmitted(false);
      setSubmittedFileName(null);
      setGradingStatus("Not Graded");
      setFeedback("");
      setScore(null);
      toast.success("Successfully deleted file.");
    } catch (error) {
      setErrorMessage("Failed to delete submission.");
      console.error("Deletion error:", error);
      toast.error("Error deleting the file.");
    }
  };

  if (isLoading || submissionLoading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" className="m-4">
        Error fetching assignment details: {error?.data?.message || "Unknown error"}
      </Alert>
    );
  }

  const isDueDatePassed = selectedAssignment && new Date() > new Date(selectedAssignment.dueDate);

  return selectedAssignment ? (
    <Container maxWidth="xxl" className=" mb-8">
      <Button
  startIcon={<ArrowBack />}
  onClick={() => navigate(-1)}
  sx={{
    color: 'gray',  // Lighter color for a subtle look
    textTransform: 'none',  // Remove uppercase to make it less prominent
    fontSize: '0.875rem',  // Smaller font size
    padding: '4px 8px',  // Compact padding
    minWidth: 'unset',  // Remove minimum width to keep it small
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',  // Light hover effect
    },
  }}
>
  Back to Assignments
</Button>
      <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
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

    <Grid item xs={12} md={4}>
 <Card variant="outlined" className="p-6">
  <Typography
    variant="h5"
    gutterBottom
    className="font-semibold"
    sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }} // Adjust font size
  >
    Submit Your Assignment
  </Typography>

  {isDueDatePassed ? (
    hasSubmitted ? (
      <SubmissionDetails
        submittedFileName={submittedFileName}
        gradingStatus={gradingStatus}
        feedback={feedback}
        score={score}
        submissionId={submissionData.submission._id}
        isPastDue={true}
        sx={{
          fontSize: { xs: '0.875rem', md: '1rem' }, // Font size for details
          display: 'flex',
          flexDirection: 'column',
          gap: '8px' // Add spacing between elements for clarity
        }}
      />
    ) : (
      <Alert
        severity="error"
        sx={{
          fontSize: { xs: '0.875rem', md: '1rem' }, // Ensure alert text scales
          padding: { xs: '8px', md: '12px' }, // Adjust padding for alert
        }}
      >
        The due date has passed. You did not submit an assignment.
      </Alert>
    )
  ) : hasSubmitted ? (
    <SubmissionDetails
      submittedFileName={submittedFileName}
      gradingStatus={gradingStatus}
      feedback={feedback}
      score={score}
      submissionId={submissionData.submission._id}
      onDelete={handleDeleteSubmission}
      sx={{
        fontSize: { xs: '0.875rem', md: '1rem' },
        display: 'flex',
        flexDirection: 'column',
        gap: '8px' // Spacing between submission details items
      }}
    />
  ) : (
    <SubmissionForm
      onFileChange={handleZipFileChange}
      onSubmit={() => handleSubmitAssignment(selectedAssignment.teacherId)}
      errorMessage={errorMessage}
      sx={{
        fontSize: { xs: '0.875rem', md: '1rem' }, // Responsive text for form elements
        '.MuiButton-root': {
          fontSize: { xs: '0.75rem', md: '1rem' }, // Button text resizing
          padding: { xs: '6px 12px', md: '8px 16px' }, // Adjust button padding
          whiteSpace: 'nowrap', // Prevents text wrapping in buttons
          width: '100%' // Ensures buttons take full width on small screens
        },
        display: 'flex',
        flexDirection: 'column',
        gap: '16px' // Spacing between form elements for better usability
      }}
      isLoadingAssignment={isLoadingAssignment}
    />
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

function SubmissionDetails({
  submittedFileName,
  gradingStatus,
  feedback,
  score,
  submissionId,
  onDelete,
  isPastDue
}) {
  return (
    <Box
      className="space-y-4"
      sx={{
        fontSize: { xs: '0.875rem', md: '1rem' }, // Responsive font size for all text
        display: 'flex',
        flexDirection: 'column',
        gap: '16px' // Ensures spacing between elements
      }}
    >
      <Typography variant="subtitle1" className="font-semibold">
        Submitted File: {submittedFileName}
      </Typography>
      <Typography
        variant="subtitle1"
        className={`font-semibold ${
          gradingStatus === "graded" ? "text-green-600" : "text-yellow-600"
        }`}
      >
        Status: {gradingStatus === "graded" ? "Graded" : "Not Graded"}
      </Typography>
      <Typography variant="subtitle1" className="font-semibold">
        Feedback: {feedback || "No feedback"}
      </Typography>
      <Typography variant="subtitle1" className="font-semibold">
        Score: {score !== null ? score : "Not scored"}
      </Typography>

      <Box
        className="flex space-x-4"
        sx={{
          flexWrap: 'wrap', // Ensures buttons wrap on smaller screens
          gap: '8px', // Adds spacing between buttons
          justifyContent: { xs: 'center', sm: 'flex-start' } // Centers on smaller screens
        }}
      >
        <Button
          variant="contained"
          startIcon={<Download />}
          href={`${BACKEND_URL}/api/student-submit/download/submission/${submissionId}`}
          target="_blank"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, // Responsive font size for button
            padding: { xs: '6px 8px', sm: '8px 12px', md: '10px 16px' }, // Adjust padding for button
            minWidth: 0, // Ensures buttons don't grow too large
            whiteSpace: 'nowrap' // Prevents button text from wrapping
          }}
        >
          Download
        </Button>

        {!isPastDue && gradingStatus !== "graded" && onDelete && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={onDelete}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, // Responsive font size for delete button
              padding: { xs: '6px 8px', sm: '8px 12px', md: '10px 16px' }, // Adjust padding for button
              minWidth: 0, // Ensures button doesn't become too wide
              whiteSpace: 'nowrap' // Prevents button text from wrapping
            }}
          >
            Delete
          </Button>
        )}
      </Box>

      {isPastDue && (
        <Typography variant="body2" color="error">
          The due date has passed. You cannot modify or delete your submission.
        </Typography>
      )}
    </Box>
  );
}


function SubmissionForm({ onFileChange, onSubmit, errorMessage,isLoadingAssignment }) {
  return (
    <Box className="space-y-4">
      <FormControl fullWidth>
        <input
          type="file"
          accept=".zip"
          onChange={onFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <FormHelperText>Upload a zip file containing your code</FormHelperText>
      </FormControl>
      {errorMessage && (
        <Typography variant="body2" color="error">
          {errorMessage}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        startIcon={<CloudUpload />}
        onClick={onSubmit}
        fullWidth
        disabled={isLoadingAssignment}
      >
        Submit
      </Button>
    </Box>
  );
}

export default AssignmentDetails;