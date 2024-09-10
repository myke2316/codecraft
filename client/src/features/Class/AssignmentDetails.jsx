import React, { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import { BASE_URLS } from "../../constants";
import { useFetchAssignmentByIdMutation } from "../Teacher/assignmentService";
import {
  useFetchSubmissionByAssignmentAndStudentIdQuery,
  useSubmitAssignmentMutation,
  useDeleteSubmissionMutation,
} from "./submissionAssignmentService";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function AssignmentDetails() {
  const { assignmentId } = useParams();
  const classId = useSelector((state) => state.class.class._id);
  const studentId = useSelector((state) => state.user.userDetails._id);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [submissionLink, setSubmissionLink] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedFileName, setSubmittedFileName] = useState(null);
  const [gradingStatus, setGradingStatus] = useState(""); // New state for grading status
  const [feedback, setFeedback] = useState(""); // State for feedback
  const [score, setScore] = useState(null); // State for score
  const [deleteSubmission] = useDeleteSubmissionMutation(); // New hook for deleting submission

  const [fetchAssignmentById, { isLoading, isError, error }] =
    useFetchAssignmentByIdMutation();
  const [submitAssignment] = useSubmitAssignmentMutation();

  const { data: submissionData, isLoading: submissionLoading } =
    useFetchSubmissionByAssignmentAndStudentIdQuery({
      assignmentId,
      studentId,
    });

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentById(assignmentId)
        .unwrap()
        .then((data) => {
          setSelectedAssignment(data);
        })
        .catch((err) => {
          console.error("Error fetching assignment:", err);
        });
    }
  }, [assignmentId, fetchAssignmentById]);

  useEffect(() => {
    if (submissionData) {
      setHasSubmitted(true);
      setSubmittedFileName(submissionData.file.filename); // Assuming `fileName` is available in the response
      setGradingStatus(submissionData.submission.status || "Not Graded"); // Set grading status if available
      setFeedback(submissionData.submission.feedback || ""); // Set feedback if available
      setScore(submissionData.submission.grade || null); // Set score if available
    }
  }, [submissionData]);

  const handleSubmissionLinkChange = (e) => {
    setSubmissionLink(e.target.value);
    setZipFile(null);
  };

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
    return <Typography variant="h6">Loading assignment details...</Typography>;
  }

  if (isError) {
    return (
      <Typography variant="h6" color="error">
        Error fetching assignment details:{" "}
        {error?.data?.message || "Unknown error"}
      </Typography>
    );
  }

  const isDueDatePassed = new Date() > new Date(selectedAssignment?.dueDate);

  return selectedAssignment ? (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Assignment Details Section */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 3 }}>
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
          </Card>
        </Grid>

        {/* Image Section with Zoom */}
        {selectedAssignment.expectedOutputImage && (
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Expected Output Image:</strong>
                </Typography>
                <Zoom>
                  <CardMedia
                    component="img"
                    image={`${BASE_URLS}/api/assignment/images/${selectedAssignment.expectedOutputImage}`}
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
            </Card>
          </Grid>
        )}

        {/* Assignment Submission Section */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Submit Your Assignment
              </Typography>

              {isDueDatePassed ? (
                <Box>
                  {hasSubmitted ? (
                    <>
                      <Typography variant="subtitle1">
                        <strong>Submitted File:</strong> {submittedFileName}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color={
                          gradingStatus === "graded" ? "success" : "warning"
                        }
                      >
                        <strong>Status:</strong>{" "}
                        {gradingStatus === "graded" ? "Graded" : "Not Graded"}
                      </Typography>
                      <Typography variant="subtitle1">
                        <strong>Feedback:</strong> {feedback || "No feedback"}
                      </Typography>
                      <Typography variant="subtitle1">
                        <strong>Score:</strong> {score !== null ? score : "Not scored"}
                      </Typography>
                      <Button
                        variant="outlined"
                        href={`${BASE_URLS}/api/student-submit/download/submission/${submissionData.submission._id}`}
                        target="_blank"
                        sx={{ mt: 2 }}
                      >
                        Download
                      </Button>
                      <Typography variant="body2" color="error">
                        The due date has passed. You cannot modify or delete
                        your submission.
                      </Typography>
                    </>
                  ) : (
                    <Typography color="error">
                      The due date has passed. You did not submit an assignment.
                    </Typography>
                  )}
                </Box>
              ) : hasSubmitted ? (
                <Box>
                  <Typography variant="subtitle1">
                    <strong>Submitted File:</strong> {submittedFileName}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color={gradingStatus === "graded" ? "success" : "warning"}
                  >
                    <strong>Status:</strong>{" "}
                    {gradingStatus === "graded" ? "Graded" : "Not Graded"}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Feedback:</strong> {feedback || "No feedback"}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Score:</strong> {score !== null ? score : "Not scored"}
                  </Typography>
                  <Button
                    variant="outlined"
                    href={`${BASE_URLS}/api/student-submit/download/submission/${submissionData.submission._id}`}
                    target="_blank"
                    sx={{ mt: 2 }}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDeleteSubmission}
                    sx={{ mt: 2 }}
                  >
                    Delete
                  </Button>
                </Box>
              ) : (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <input
                      type="file"
                      id="zip-file-upload"
                      accept=".zip"
                      onChange={handleZipFileChange}
                      style={{ marginTop: 10 }}
                    />
                    <FormHelperText>
                      Upload a zip file containing your code
                    </FormHelperText>
                  </FormControl>
                  {errorMessage && (
                    <Typography variant="body2" color="error" gutterBottom>
                      {errorMessage}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      handleSubmitAssignment(selectedAssignment.teacherId)
                    }
                  >
                    Submit
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  ) : (
    <Typography variant="h6">Assignment not found</Typography>
  );
}

export default AssignmentDetails;
