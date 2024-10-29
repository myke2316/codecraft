import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useParams } from "react-router";
import { useCreateActivityAssignmentMutation } from "./assignmentService";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";

// Validation Schema
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

function TeacherAssignment({ setDialogOpen, refreshAssignments }) {
  const { classId } = useParams();
  const [createAssignment] = useCreateActivityAssignmentMutation();
  const teacherId = useSelector((state) => state.user.userDetails._id);

  // State to store the preview URL and file name
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState("");

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("dueDate", values.dueDate);
      formData.append("instructions", values.instructions);
      formData.append("status", "draft");
      formData.append("target", values.target);
      formData.append("classId", values.target === "all" ? "" : classId || "");
      formData.append("teacherId", teacherId || "");
      if (values.image) {
        formData.append("image", values.image);
      }

      // Call the mutation to create the assignment
      const res = await createAssignment(formData).unwrap();
      console.log(res);
      toast.success("Successfully created class");
      refreshAssignments();
      // Reset the form after successful submission
      resetForm();
      setImagePreview(null); // Clear the image preview
      setImageName(""); // Clear the image name
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to create assignment:", error);
    }
  };

  return (
    <Container maxWidth="sm">
   
      <Paper style={{ padding: 20, marginTop: 20 }}>
        <Typography variant="h4" gutterBottom>
          Create Assignment
        </Typography>
        <Formik
          initialValues={{
            title: "",
            description: "",
            dueDate: "",
            instructions: "",
            target: "specific",
            image: null,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            setFieldValue,
            values,
            handleChange,
            handleBlur,
            errors,
            touched,
            isSubmitting
          }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    name="title"
                    as={TextField}
                    label="Title"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.title}
                    required
                    helperText={<ErrorMessage name="title" />}
                    error={Boolean(errors.title && touched.title)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    name="description"
                    as={TextField}
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.description}
                    required
                    helperText={<ErrorMessage name="description" />}
                    error={Boolean(errors.description && touched.description)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    name="dueDate"
                    as={TextField}
                    label="Due Date"
                    type="date"
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.dueDate}
                    required
                    helperText={<ErrorMessage name="dueDate" />}
                    error={Boolean(errors.dueDate && touched.dueDate)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    name="instructions"
                    as={TextField}
                    label="Instructions"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.instructions}
                    required
                    helperText={<ErrorMessage name="instructions" />}
                    error={Boolean(errors.instructions && touched.instructions)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Typography>Target:</Typography>
                    <Field
                      name="target"
                      as={Select}
                      label="Target"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.target}
                      required
                    >
                      <MenuItem value="all">All Classes</MenuItem>
                      <MenuItem value="specific">Specific Class</MenuItem>
                    </Field>
                    <ErrorMessage name="target">
                      {(msg) => <Typography color="error">{msg}</Typography>}
                    </ErrorMessage>
                  </FormControl>
                </Grid>

                {values.target === "specific" && (
                  <Grid item xs={12}>
                    <Typography>Class ID: {classId}</Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  Image:
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
                </Grid>

                {/* Display the image preview and its name */}
                {imagePreview && (
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

                <Grid item xs={12}>
                  <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}>
                    Save Assignment
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}

export default TeacherAssignment;
