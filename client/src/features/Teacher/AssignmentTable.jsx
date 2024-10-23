import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Box,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  useDeleteAssignmentMutation,
  useEditAssignmentMutation,
} from "./assignmentService";
import { useNavigate, useParams } from "react-router";
import { BACKEND_URL } from "../../constants";
import { useFetchAllSubmissionByClassIdQuery } from "../Class/submissionAssignmentService";
import RefreshIcon from "@mui/icons-material/Refresh";
// Validation Schema for Editing (unchanged)
const validationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  description: Yup.string()
    .required("Description is required")
    .max(1000, "Description cannot exceed 1000 characters"),
  dueDate: Yup.date()
    .required("Due date is required")
    .min(new Date(), "Due date cannot be in the past"),
  instructions: Yup.string().required("Instructions are required"),
  target: Yup.string()
    .required("Target is required")
    .oneOf(["all", "specific"], "Invalid target"),
  image: Yup.mixed()
    .nullable()
    .test(
      "fileType",
      "Unsupported File Format",
      (value) =>
        !value || ["image/jpeg", "image/png", "image/gif"].includes(value.type)
    )
    .test(
      "fileSize",
      "File Size is too large",
      (value) => !value || value.size <= 2 * 1024 * 1024 // 2MB
    ),
});

function formatDateToReadable(dateString) {
  const date = new Date(dateString);
  const months = [
    "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
    "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day < 10 ? "0" + day : day}, ${year}`;
}

function AssignmentTable({ onCreate, assignments, refreshAssignments }) {
  const [deleteAssignmentTeacher] = useDeleteAssignmentMutation();
  const [editAssignmentTeacher] = useEditAssignmentMutation();
  const { classId } = useParams();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: submissionsData,refetch } = useFetchAllSubmissionByClassIdQuery(classId);

  const handleOpenEditDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setOpenEditDialog(true);
  };
  const handleRefresh = async () => {
   refetch()
  };
  const handleCloseEditDialog = () => {
    setSelectedAssignment(null);
    setOpenEditDialog(false);
    setImagePreview(null);
    setImageName("");
  };

  const handleEditAssignment = async (values) => {
    try {
      const formData = new FormData();
      formData.append("assignmentId", selectedAssignment._id);
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("dueDate", values.dueDate);
      formData.append("instructions", values.instructions);
      formData.append("target", values.target);
      formData.append("classId", values.target === "all" ? "" : classId || "");
      formData.append("editForAll", values.target === "all");

      if (values.image) {
        formData.append("image", values.image);
      }

      const res = await editAssignmentTeacher(formData).unwrap();
      toast.success("Assignment edited successfully!");
      setImagePreview(null);
      setImageName("");
      handleCloseEditDialog();
      refreshAssignments();
    } catch (error) {
      toast.error(`Failed to edit assignment: ${error.message}`);
    }
  };

  const handleOpenDeleteDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedAssignment(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteAssignment = async () => {
    try {
      await deleteAssignmentTeacher(selectedAssignment._id).unwrap();
      toast.success("Assignment deleted successfully!");
      handleCloseDeleteDialog();
      refreshAssignments();
    } catch (error) {
      toast.error(`Failed to delete assignment: ${error.message}`);
    }
  };

  function handleViewClick(assignmentId) {
    navigate(`${assignmentId}/view/teacher`);
  }

  const getSubmissionStats = (assignmentId) => {
    if (!submissionsData) return { total: 0, graded: 0 };

    const assignmentSubmissions = submissionsData.submissions.filter(
      (sub) => sub.assignmentId?._id === assignmentId
    );
    const total = assignmentSubmissions.length;
    const graded = assignmentSubmissions.filter((sub) => sub.graded === true).length;

    return { total, graded };
  };

  return (
    <Box sx={{  bgcolor: 'background.default' }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     
        <Button
          variant="contained"
          color="primary"
          onClick={onCreate}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            px: 3,
            py: 1,
            boxShadow: 2,
          }}
        >
          Create Assignment
        </Button>
        <IconButton
          onClick={handleRefresh}
        
          color="primary"
          aria-label="refresh assignments"
          sx={{
            '&:hover': { transform: 'scale(1.1)' },
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {assignments.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: '15px' }}>
          <Typography variant="h6" color="text.secondary">
            No assignments available.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {assignments.map((assignment) => {
            const { total, graded } = getSubmissionStats(assignment._id);
            return (
              <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                <Card elevation={3} sx={{ borderRadius: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <AssignmentIcon />
                      </Avatar>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {assignment.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Due: {formatDateToReadable(assignment.dueDate)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip label={`Submissions: ${total}`} color="primary" variant="outlined" size="small" />
                      <Chip label={`Graded: ${graded}`} color="secondary" variant="outlined" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Target: {assignment.target === "all" ? "All Classes" : "This Class"}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <IconButton
                      color="primary"
                      aria-label="view assignment"
                      onClick={() => handleViewClick(assignment._id)}
                      sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      aria-label="edit assignment"
                      onClick={() => handleOpenEditDialog(assignment)}
                      sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      aria-label="delete assignment"
                      onClick={() => handleOpenDeleteDialog(assignment)}
                      sx={{ '&:hover': { transform: 'scale(1.1)' } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Edit Assignment Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog} 
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '15px',
            maxWidth: isMobile ? '100%' : '600px',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '	#928fce', color: 'primary.contrastText' }}>
          Edit Assignment
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Formik
            initialValues={{
              title: selectedAssignment?.title || "",
              description: selectedAssignment?.description || "",
              dueDate: selectedAssignment?.dueDate?.substring(0, 10) || "",
              instructions: selectedAssignment?.instructions || "",
              target: selectedAssignment?.target || "specific",
              image: null,
            }}
            validationSchema={validationSchema}
            onSubmit={handleEditAssignment}
          >
            {({
              setFieldValue,
              values,
              handleChange,
              handleBlur,
              errors,
              touched,
            }) => (
              <Form>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Title"
                  type="text"
                  name="title"
                  fullWidth
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  helperText={<ErrorMessage name="title" />}
                  error={Boolean(errors.title && touched.title)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Description"
                  type="text"
                  name="description"
                  fullWidth
                  multiline
                  rows={4}
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  helperText={<ErrorMessage name="description" />}
                  error={Boolean(errors.description && touched.description)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={values.dueDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  helperText={<ErrorMessage name="dueDate" />}
                  error={Boolean(errors.dueDate && touched.dueDate)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Instructions"
                  type="text"
                  name="instructions"
                  fullWidth
                  multiline
                  rows={4}
                  value={values.instructions}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  helperText={<ErrorMessage name="instructions" />}
                  error={Boolean(errors.instructions && touched.instructions)}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth margin="dense" required sx={{ mb: 2 }}>
                  <InputLabel>Target</InputLabel>
                  <Select
                    name="target"
                    value={values.target}
                    onChange={(e) => {
                      setFieldValue("target", e.target.value);
                      if (e.target.value === "all") {
                        setFieldValue("classId", "");
                      }
                    }}
                    onBlur={handleBlur}
                  >
                    <MenuItem value="all">All Classes</MenuItem>
                    <MenuItem value="specific">Specific Class</MenuItem>
                  </Select>
                  <ErrorMessage name="target" component="div" />
                </FormControl>
                {values.target === "specific" && (
                  <Typography sx={{ mb: 2 }}>Class ID: {classId}</Typography>
                )}

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      setFieldValue("image", file);
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                        setImageName(file.name);
                      } else {
                        setImagePreview(null);
                        setImageName("");
                      }
                    }}
                    onBlur={handleBlur}
                    style={{ marginTop: 8 }}
                  />
                  <ErrorMessage name="image">
                    {(msg) => 
                      <Typography color="error">{msg}</Typography>
                    }
                  </ErrorMessage>
                </FormControl>

                {!imagePreview && selectedAssignment?.expectedOutputImage ? (
                  <Box sx={{ mb:  2 }}>
                    <Typography sx={{ mb: 1 }}>Current Image:</Typography>
                    <img
                      src={`${BACKEND_URL}/api/assignment/images/${selectedAssignment.expectedOutputImage}`}
                      alt="Current assignment"
                      style={{ maxWidth: "100%", borderRadius: '8px' }}
                    />
                  </Box>
                ) : imagePreview && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ mb: 1 }}>New Image Preview:</Typography>
                    <img
                      src={imagePreview}
                      alt="New assignment preview"
                      style={{ maxWidth: "100%", borderRadius: '8px' }}
                    />
                    <Typography variant="caption">{imageName}</Typography>
                  </Box>
                )}

                <DialogActions sx={{ p: 0, mt: 2 }}>
                  <Button onClick={handleCloseEditDialog} color="primary">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" variant="contained">
                    Save
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            borderRadius: '15px',
            p: 2,
          }
        }}
      >
        <DialogTitle sx={{ color: 'error.main' }}>Delete Assignment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the assignment titled "
            {selectedAssignment?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAssignment}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AssignmentTable;