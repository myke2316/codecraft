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
  FormControlLabel,
  Checkbox,
  InputLabel,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  useDeleteAssignmentMutation,
  useEditAssignmentMutation,
} from "./assignmentService";
import { useNavigate, useParams } from "react-router";
import { BASE_URLS } from "../../constants";

// Validation Schema for Editing
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
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dec.",
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
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  // State to store the preview URL and file name
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");
  const navigate = useNavigate();
  const handleOpenEditDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedAssignmentId(assignment._id);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedAssignment(null);
    setOpenEditDialog(false);
    setImagePreview(null); // Clear the image preview
    setImageName(""); // Clear the image name
  };

  const handleEditAssignment = async (values) => {
    console.log(selectedAssignment._id);
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
      console.log(selectedAssignment);
      const res = await editAssignmentTeacher(formData).unwrap();
      console.log(res);
      toast.success("Assignment edited successfully!");
      setImagePreview(null);
      setImageName("");
      handleCloseEditDialog();
      refreshAssignments();
    } catch (error) {
      toast.error(`Failed to edit assignment: ${error.message}`);
    }
  };

  // const handleEditAssignment = async (values) => {
  //   console.log(selectedAssignment._id);
  //   try {
  //     const formData = new FormData();
  //     formData.append("assignmentId", selectedAssignment._id);
  //     formData.append("title", values.title);
  //     formData.append("description", values.description);
  //     formData.append("dueDate", values.dueDate);
  //     formData.append("instructions", values.instructions);
  //     formData.append("target", values.target);
  //     formData.append(
  //       "classId",
  //       values.target === "all" ? "" : selectedAssignment.classId || ""
  //     );
  //     formData.append("editForAll", values.target === "all");

  //     if (values.image) {
  //       formData.append("image", values.image);
  //     }
  //     console.log(selectedAssignment);
  //     const res = await editAssignmentTeacher({
  //       assignmentId: selectedAssignment._id,
  //       title: values.title,
  //       description: values.description,
  //       dueDate: values.dueDate,
  //       instructions: values.instructions,
  //       target: values.target,
  //       classId: values.target === "all" ? "" : classId || "",
  //       editForAll: values.target === "all",
  //       image: values.image ? values.image : null,
  //     }).unwrap();
  //     console.log(res);
  //     toast.success("Assignment edited successfully!");
  //     setImagePreview(null); // Clear the image preview
  //     setImageName(""); // Clear the image name
  //     handleCloseEditDialog();
  //     refreshAssignments();
  //   } catch (error) {
  //     toast.error(`Failed to edit assignment: ${error.message}`);
  //   }
  // };

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

  return (
    <TableContainer component={Paper}>
      <Button
        variant="contained"
        color="primary"
        onClick={onCreate}
        style={{ margin: 20 }}
      >
        Create Assignment
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Submissions</TableCell>
            <TableCell>Graded</TableCell>
            <TableCell>Target</TableCell>
            <TableCell>Date Created</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assignments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography align="center" color="textSecondary">
                  No assignments available.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            assignments.map((assignment) => (
              <TableRow key={assignment._id}>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>{assignment.submissions}</TableCell>
                <TableCell>{assignment.graded}</TableCell>
                <TableCell>
                  {assignment.target === "all" ? "All Class" : "This Class"}
                </TableCell>
                <TableCell>
                  {formatDateToReadable(assignment.createdAt) || "X"}
                </TableCell>
                <TableCell>
                  {formatDateToReadable(assignment.dueDate) || "X"}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    aria-label="view assignment"
                    onClick={() => handleViewClick(assignment._id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    aria-label="edit assignment"
                    onClick={() => handleOpenEditDialog(assignment)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    aria-label="delete assignment"
                    onClick={() => handleOpenDeleteDialog(assignment)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Assignment Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Assignment</DialogTitle>
        <DialogContent>
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
                />
                <FormControl fullWidth margin="dense" required>
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
                  <Grid item xs={12}>
                    <Typography>Class ID: {classId}</Typography>
                  </Grid>
                )}

                {/* Image */}
                <FormControl fullWidth>
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
                    {(msg) => <Typography color="error">{msg}</Typography>}
                  </ErrorMessage>
                </FormControl>

                {!imagePreview && selectedAssignment?.expectedOutputImage ? (
                  <Grid item xs={12}>
                    <Typography>Image Preview :</Typography>
                    <img
                      src={`${BASE_URLS}/api/assignment/images/${selectedAssignment.expectedOutputImage}`}
                      alt="Uploaded preview"
                      style={{ maxWidth: "100%", marginTop: 8 }}
                    />
                    <Typography></Typography>
                  </Grid>
                ) : (
                  <Grid item xs={12}>
                    <Typography>Image Preview:</Typography>
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      style={{ maxWidth: "100%", marginTop: 8 }}
                    />
                    <Typography>{imageName}</Typography>
                  </Grid>
                )}

                {/* <FormControl fullWidth margin="dense">
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg, image/png, image/gif"
                    onChange={(e) => {
                      setFieldValue("image", e.currentTarget.files[0]);
                    }}
                  />
                  <ErrorMessage name="image" component="div" />
                </FormControl> */}

                <DialogActions>
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
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Assignment</DialogTitle>
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
            color="secondary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
}

export default AssignmentTable;
