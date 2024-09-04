import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import {
  useCreateAnnouncementMutation,
  useGetAnnouncementsByClassQuery,
  useDeleteAnnouncementMutation,
  useUpdateAnnouncementMutation,
} from "./announcementService";
import { useParams } from "react-router";
import { toast } from "react-toastify";

const targetClassOptions = [
  { value: "all", label: "For All Classes" },
  { value: "specific", label: "For This Class" },
];

const AnnouncementSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  content: Yup.string().required("Content is required"),
  targetClass: Yup.string().required("Target class is required"),
});

function TeacherAnnouncement() {
  const { classId } = useParams();
  const teacherId = useSelector((state) => state.user.userDetails._id);

  // Fetch announcements for the specific class
  const { data: announcementsData, refetch } =
    useGetAnnouncementsByClassQuery(classId);
  const [announcements, setAnnouncements] = useState([]);

  // Handle fetching and setting announcements
  useEffect(() => {
    if (announcementsData) {
      // If announcements are for 'all', filter to only show one per title
      const uniqueAnnouncements = [];
      const titles = new Set();
      announcementsData.forEach((announcement) => {
        if (announcement.target === "all" && !titles.has(announcement.title)) {
          titles.add(announcement.title);
          uniqueAnnouncements.push(announcement);
        } else if (announcement.target === "specific") {
          uniqueAnnouncements.push(announcement);
        }
      });
      setAnnouncements(uniqueAnnouncements);
    }
  }, [announcementsData]);

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(""); // State for managing Quill content

  //delete
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  async function handleDeleteAnnouncement(id) {
    try {
      await deleteAnnouncement(id).unwrap();
      toast.success("Announcement deleted successfully");
      refetch(); // Refresh the announcements after deletion
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete announcement");
    }
  }
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  //create
  const [createNewAnnouncement, { isLoading: createAnnouncementLoading }] =
    useCreateAnnouncementMutation();

  async function handleSubmitAnnouncement(values) {
    try {
      const res = await createNewAnnouncement({
        title: values.title,
        content: values.content, 
        target: values.targetClass,
        classId: values.targetClass === "all" ? null : classId,
        teacherId,
      }).unwrap();
      toast.success("Successfully Posted The Announcement");
      handleClose();
      refetch(); // Refresh the announcements after successful creation
    } catch (error) {
      console.log(error);
      toast.error("Failed to Post The Announcement");
    }
  }

  //edit
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const handleEditClick = (announcement) => {
    setEditAnnouncement(announcement);
    setOpenEditDialog(true);
  };
  async function handleUpdateAnnouncement(values) {
    try {
      const res = await updateAnnouncement({
        id: editAnnouncement._id,
        data: {
          title: values.title,
          content: values.content,
          target: values.targetClass,
        },
      }).unwrap(); // Use unwrap() to handle the promise correctly
      console.log(res);
      setOpenEditDialog(false);
      refetch();
      toast.success("Announcement updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update announcement");
    }
  }

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header Section */}
      <Typography variant="h5" gutterBottom>
        Announcements
      </Typography>
      <Typography variant="body1" gutterBottom>
        Post updates and important information to keep your team in the loop.
        Your announcement will appear on the Activities Dashboard.
      </Typography>

      {/* Add and Refresh Announcement Buttons */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 3 }}
        onClick={handleClickOpen}
      >
        Add Announcement
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{ ml: 3, mb: 3 }}
        onClick={refetch} // Refresh the announcements
      >
        Refresh
      </Button>

      {/* Announcements Table */}
      <TableContainer component={Paper}>
        {announcements.length === 0 ? (
          <Box sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No announcements available.
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Visible to</TableCell>
                <TableCell>Date Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement._id}>
                  <TableCell>{announcement.title}</TableCell>
                  <TableCell>
                    {announcement.target === "all"
                      ? "All Classes"
                      : "This Class"}
                  </TableCell>
                  <TableCell>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(announcement)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => {
                        setAnnouncementToDelete(announcement._id);
                        setOpenConfirmDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Add Announcement Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Announcement</DialogTitle>
        <Formik
          initialValues={{
            title: "",
            content: "",
            targetClass: targetClassOptions[0].value, // Default to 'All Classes'
          }}
          validationSchema={AnnouncementSchema}
          onSubmit={(values) => handleSubmitAnnouncement(values)}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="title"
                      label="Title"
                      fullWidth
                      variant="outlined"
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      Content
                    </Typography>
                    <ReactQuill
                      theme="snow"
                      value={values.content} // Bind Formik's content state here
                      onChange={(value) => {
                        setFieldValue("content", value); // Sync with Formik
                      }}
                    />
                    {touched.content && errors.content ? (
                      <Typography color="error" variant="body2">
                        {errors.content}
                      </Typography>
                    ) : null}
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="targetClass"
                      label="Target Class"
                      select
                      fullWidth
                      variant="outlined"
                      error={touched.targetClass && Boolean(errors.targetClass)}
                      helperText={touched.targetClass && errors.targetClass}
                    >
                      {targetClassOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="secondary">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Submit
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/*DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this announcement?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (announcementToDelete) {
                await handleDeleteAnnouncement(announcementToDelete);
                setAnnouncementToDelete(null);
              }
              setOpenConfirmDialog(false);
            }}
            variant="contained"
            color="primary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG BOX */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Announcement</DialogTitle>
        <Formik
          initialValues={{
            title: editAnnouncement?.title || "",
            content: editAnnouncement?.content || "",
            targetClass:
              editAnnouncement?.target || targetClassOptions[0].value,
          }}
          validationSchema={AnnouncementSchema}
          onSubmit={(values) => handleUpdateAnnouncement(values)}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="title"
                      label="Title"
                      fullWidth
                      variant="outlined"
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      Content
                    </Typography>
                    <ReactQuill
                      theme="snow"
                      value={values.content}
                      onChange={(value) => {
                        setFieldValue("content", value);
                      }}
                    />
                    {touched.content && errors.content ? (
                      <Typography color="error" variant="body2">
                        {errors.content}
                      </Typography>
                    ) : null}
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="targetClass"
                      label="Target Class"
                      select
                      fullWidth
                      variant="outlined"
                      error={touched.targetClass && Boolean(errors.targetClass)}
                      helperText={touched.targetClass && errors.targetClass}
                    >
                      {targetClassOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button type="button" onClick={() => setOpenEditDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={createAnnouncementLoading}
                >
                  Save Changes
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}

export default TeacherAnnouncement;
