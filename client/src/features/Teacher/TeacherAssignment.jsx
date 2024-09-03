import React from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  FormControl,
} from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useParams } from "react-router";
import { useCreateActivityAssignmentMutation } from "./assignmentService";
import { useSelector } from "react-redux";

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

function TeacherAssignment({ setDialogOpen }) {
  const { classId } = useParams();
  const [createAssignment] = useCreateActivityAssignmentMutation();
  const teacherId = useSelector((state) => state.user.userDetails._id);
  const handleSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("dueDate", values.dueDate);
      formData.append("instructions", values.instructions);
      formData.append("status", "draft");
      formData.append("classId", classId || "");
      formData.append("teacherId", teacherId || "");
      if (values.image) {
        formData.append("image", values.image);
      }

      // Call the mutation to create the assignment
      const res = await createAssignment(formData).unwrap();
      console.log(res);
      // Reset the form after successful submission
      resetForm(); 
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
            classId: classId || "",
            instructions: "",
            status: "draft",
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
                    type="datetime-local"
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
                  Image:
                  <FormControl fullWidth>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={(event) => {
                        setFieldValue("image", event.currentTarget.files[0]);
                      }}
                      onBlur={handleBlur}
                      style={{ marginTop: 8 }}
                    />
                    <ErrorMessage name="image">
                      {(msg) => <Typography color="error">{msg}</Typography>}
                    </ErrorMessage>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Button variant="contained" color="primary" type="submit">
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
