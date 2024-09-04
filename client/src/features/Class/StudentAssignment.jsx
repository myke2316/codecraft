import React, { useEffect, useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useFetchAssignmentByClassIdMutation } from "../Teacher/assignmentService"; // Adjust the path as per your project structure
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Divider,
  TextField,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { CalendarToday, Description } from "@mui/icons-material";
import { BASE_URLS } from "../../constants";

function StudentAssignment() {
  const classId = useSelector((state) => state.class.class._id);
  const [fetchAssignmentByClassId, { isLoading, isError }] = useFetchAssignmentByClassIdMutation();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [open, setOpen] = useState(false);

  // Submission States
  const [submissionLink, setSubmissionLink] = useState("");
  const [zipFile, setZipFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleOpen = (assignment) => {
    setSelectedAssignment(assignment);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAssignment(null);
    setSubmissionLink("");
    setZipFile(null);
    setErrorMessage("");
  };

  const handleSubmissionLinkChange = (e) => {
    setSubmissionLink(e.target.value);
    setZipFile(null); // Clear zipFile if a link is provided
  };

  const handleZipFileChange = (e) => {
    setZipFile(e.target.files[0]);
    setSubmissionLink(""); // Clear link if a zip file is selected
  };

  // Placeholder function for handling submission
  const handleSubmitAssignment = () => {
    if (!submissionLink && !zipFile) {
      setErrorMessage("Either a submission link or a zip file is required.");
      return;
    }
    if (submissionLink && zipFile) {
      setErrorMessage("You can only provide a submission link or a zip file, not both.");
      return;
    }

    setErrorMessage("");
    // Submission handling logic to be implemented here
  };

  if (isLoading) return <Typography variant="h6">Loading assignments...</Typography>;
  if (isError) return <Typography variant="h6">Error loading assignments.</Typography>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Assignments
      </Typography>
      {assignments.length === 0 ? (
        <Typography variant="body1">No assignments available for this class.</Typography>
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
                  <Button size="small" color="primary" onClick={() => handleOpen(assignment)}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal for displaying assignment details and submission form */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        {selectedAssignment && (
          <>
            <DialogTitle>{selectedAssignment.title}</DialogTitle>
            <DialogContent dividers>
              <DialogContentText>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Description:</strong>
                </Typography>
                {selectedAssignment.description}
              </DialogContentText>
              <Divider sx={{ my: 2 }} />
              <DialogContentText>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Instructions:</strong>
                </Typography>
                {selectedAssignment.instructions}
              </DialogContentText>
              <Divider sx={{ my: 2 }} />
              <DialogContentText>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Due Date:</strong> {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Created At:</strong> {new Date(selectedAssignment.createdAt).toLocaleDateString()}
                </Typography>
              </DialogContentText>
              <Divider sx={{ my: 2 }} />

              {/* Image Section with Zoom */}
              {selectedAssignment.expectedOutputImage && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Expected Output Image:</strong>
                  </Typography>
                  <Zoom>
                    <img
                      src={`${BASE_URLS}/api/assignment/images/${selectedAssignment.expectedOutputImage}`}
                      alt="Expected Output"
                      style={{ borderRadius: 8, maxWidth: "100%", maxHeight: 300, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                    />
                  </Zoom>
                </Box>
              )}

              {/* Assignment Submission Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Submit Your Assignment
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Submission Link"
                    variant="outlined"
                    value={submissionLink}
                    onChange={handleSubmissionLinkChange}
                    disabled={!!zipFile} // Disable if a zip file is selected
                  />
                  <FormHelperText>Enter a URL link for your assignment (if applicable).</FormHelperText>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel htmlFor="zip-file-upload"></InputLabel>
                  <input
                    type="file"
                    id="zip-file-upload"
                    accept=".zip"
                    onChange={handleZipFileChange}
                    disabled={!!submissionLink} // Disable if a link is provided
                    style={{ marginTop: 10 }}
                  />
                  <FormHelperText>Upload a zip file containing your code (if applicable).</FormHelperText>
                </FormControl>
                {errorMessage && (
                  <Typography variant="body2" color="error" gutterBottom>
                    {errorMessage}
                  </Typography>
                )}
                <Button variant="contained" color="primary" onClick={handleSubmitAssignment}>
                  Submit
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default StudentAssignment;
