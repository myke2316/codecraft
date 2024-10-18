import React, { useEffect } from "react";
import { TextField, Button, Typography, Box, Paper, Grid } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useFetchSubmissionByAssignmentAndStudentIdQuery, useTeacherGradeFeedBackMutation } from "../Class/submissionAssignmentService";
import { useNavigate, useParams } from "react-router";
import { BACKEND_URL, BASE_URLS } from "../../constants";
import { toast } from "react-toastify";

function TeacherAssignmentGrade() {
  const { assignmentId, studentId } = useParams();

  // Fetch the submission
  const {
    data: submission,
    error,
    isLoading,
  } = useFetchSubmissionByAssignmentAndStudentIdQuery({
    assignmentId,
    studentId,
  });

  // Mutation hook for submitting grade and feedback
  const [submitGradeFeedback, { isLoading: isSubmitting, error: submissionError }] = useTeacherGradeFeedBackMutation();

  // Formik setup
  const formik = useFormik({
    initialValues: {
      feedback: submission?.submission?.feedback || "",
      grade: submission?.submission?.grade || 0,
    },
    validationSchema: Yup.object({
      feedback: Yup.string().required("Feedback is required"),
      grade: Yup.number().min(0, "Grade must be at least 0").max(100, "Grade must be at most 100").required("Grade is required"),
    }),
    onSubmit: async (values) => {
      try {
        // Trigger the mutation to submit or edit grade and feedback
        await submitGradeFeedback({
          submissionId: submission?.submission?._id,
          grade: values.grade,
          feedback: values.feedback,
        });
        toast.success("Grade or Feedback successfully updated")
        console.log("Grade and feedback submitted successfully.");
      } catch (err) {
        console.error("Error submitting grade and feedback", err);
      }
    },
  });

  useEffect(() => {
    if (submission) {
      formik.setValues({
        feedback: submission.submission.feedback || "",
        grade: submission.submission.grade || 0,
      });
    }
  }, [submission]);
const navigate = useNavigate()
  // Handle file download
  const handleDownload = async () => {
    try {
      const downloadUrl = `${BACKEND_URL}/api/student-submit/download/submission/${submission.submission._id}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", ""); // Optional: add a custom file name if necessary
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Downloading file...");
    } catch (err) {
      console.error("Error downloading file", err);
    }
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error fetching submission</Typography>;

  // Check if the submission is already graded
  const isGraded = submission?.submission?.graded !== "pending";

  return (
    <Box p={3} component={Paper} elevation={3}>
      <Button onClick={() => navigate(-1)}>Back</Button>
      <Typography variant="h5" gutterBottom>
        {isGraded ? "Edit Grade and Feedback" : "Grade Submission"}
      </Typography>

      <Grid container spacing={2}>
        {/* Zip File Preview Section */}
        <Grid item xs={12}>
          <Box p={2} sx={{ border: "1px solid #ccc", borderRadius: 2 }}>
            <Typography variant="body1">
              Submitted by:{" "}
              {submission?.submission?.studentId?.username || "Student"}
            </Typography>
            {submission?.file?.filename ? (
              <>
                <Typography variant="body2" gutterBottom>
                  Zip File: {submission.file.filename}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleDownload}
                  sx={{ mt: 2 }}
                >
                  Download Zip File
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="error">
                No zip file uploaded.
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Feedback Section */}
        <Grid item xs={12}>
          <TextField
            label="Feedback"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            {...formik.getFieldProps('feedback')}
            error={formik.touched.feedback && Boolean(formik.errors.feedback)}
            helperText={formik.touched.feedback && formik.errors.feedback}
            sx={{ mb: 2 }}
          />
        </Grid>

        {/* Grade Section */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Grade (0-100)"
            type="number"
            fullWidth
            variant="outlined"
            {...formik.getFieldProps('grade')}
            error={formik.touched.grade && Boolean(formik.errors.grade)}
            helperText={formik.touched.grade && formik.errors.grade}
            inputProps={{ min: 0, max: 100 }}
          />
        </Grid>

        {/* Submit/Edit Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={formik.handleSubmit}
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Submitting..."
              : isGraded
              ? "Edit Grade and Feedback"
              : "Submit Grade and Feedback"}
          </Button>
          {submissionError && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error submitting grade and feedback.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default TeacherAssignmentGrade;
