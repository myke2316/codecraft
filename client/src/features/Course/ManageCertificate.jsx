import React, { useEffect, useState } from "react";
import { useUserCompletedCourseQuery } from "../LoginRegister/userService";
import { useFetchUserAnalyticsMutation } from "../Student/userAnalyticsService";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  CardMedia,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSelector } from "react-redux";
import {
  useCreateSignatureMutation,
  useGetSignatureQuery,
  useUpdateSignatureMutation,
} from "./certificateService";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { BACKEND_URL } from "../../constants";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useLocation } from "react-router";

function ManageCertificate() {
  const { data, error, isLoading } = useUserCompletedCourseQuery();
  const [fetchUserAnalytics] = useFetchUserAnalyticsMutation();
  const [studentsWithPoints, setStudentsWithPoints] = useState([]);
  const [filterClass, setFilterClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const classDetails = useSelector((state) => state.class.class);
  const location = useLocation();
  const isAdmin = location.pathname.includes("/certificate/admin/manage");
  const [openDialog, setOpenDialog] = useState(false);
  const [createSignature] = useCreateSignatureMutation();
  const [updateSignature] = useUpdateSignatureMutation();
  const userDetails = useSelector((state) => state.user.userDetails);
  const {
    data: signatureData,
    isLoading: isSignatureLoading,
    refetch: refetchSignature,
  } = useGetSignatureQuery(userDetails._id);

  useEffect(() => {
    const fetchPoints = async () => {
      if (data?.users?.length) {
        const updatedStudents = await Promise.all(
          data.users.map(async (student) => {
            try {
              const analyticsResponse = await fetchUserAnalytics({
                userId: student._id,
              }).unwrap();
              const totalPoints = analyticsResponse.coursesAnalytics.reduce(
                (acc, course) => {
                  return acc + (course.totalPointsEarned || 0);
                },
                0
              );
              return {
                ...student,
                totalPoints,
              };
            } catch (error) {
              console.error(
                `Error fetching analytics for student ${student._id}:`,
                error
              );
              return {
                ...student,
                totalPoints: 0,
              };
            }
          })
        );
        setStudentsWithPoints(updatedStudents);
      }
    };

    fetchPoints();
  }, [data, fetchUserAnalytics]);

  const handleUploadClick = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  teacherName: Yup.string().required("Name is required"),
  signature: Yup.mixed().nullable(),

});

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("userId", userDetails._id);
      formData.append("name", `${values.title} ${values.teacherName}`);
      formData.append("role", userDetails.role);

      if (values.signature) {
        formData.append("signature", values.signature);
      }

      let response;
      if (signatureData) {
        response = await updateSignature(formData).unwrap();
        toast.success("Signature updated successfully");
      } else {
        response = await createSignature(formData).unwrap();
        toast.success("Signature uploaded successfully");
      }

      console.log("Signature operation successful:", response.data);

      resetForm();
      setOpenDialog(false);
      refetchSignature();
    } catch (error) {
      console.error("Error with signature operation:", error);
      toast.error(error.message || "Failed to process signature");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and search logic for students
 const filteredStudents = studentsWithPoints
    .filter((student) => {
      if (isAdmin) {
        return true; // Admin sees all students
      } else if (filterClass === "all") {
        return classDetails.some((cls) => cls.students.includes(student._id));
      } else {
        return classDetails
          .find((cls) => cls._id === filterClass)
          ?.students.includes(student._id);
      }
    })
    .filter((student) => {
      return (
        student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  if (isLoading || isSignatureLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="text-red-500 text-center">
  //       Error fetching students: {error.message}
  //     </div>
  //   );
  // }

  return (
    <div className="p-6">
      <div className="mb-4">
        {signatureData && (
          <Box display="flex" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              {signatureData.signature.name}
            </Typography>

            <Zoom>
              <CardMedia
                component="img"
                image={`${BACKEND_URL}/certificate/signatures/${signatureData.signature.signatureId}`}
                alt="Signature"
                sx={{
                  borderRadius: 2,
                  width: 120,
                  height: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  ml: 2,
                }}
              />
            </Zoom>
          </Box>
        )}
        <Button variant="contained" color="primary" onClick={handleUploadClick}>
          {signatureData ? "Edit Signature & Name" : "Upload Signature & Name"}
        </Button>
      </div>

      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>
          {signatureData ? "Edit" : "Upload"} Signature, Name, and Title
        </DialogTitle>
        <Formik
          initialValues={{
            title: signatureData
              ? signatureData.signature.name.split(" ")[0]
              : "",
            teacherName: signatureData
              ? signatureData.signature.name.split(" ").slice(1).join(" ")
              : "",
            signature: null,
            keepExistingSignature: true,
          }}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ setFieldValue, values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <DialogContentText>
                  Please {signatureData ? "edit" : "upload"} your signature,
                  select your title, and enter your name to appear on the
                  certificate.
                </DialogContentText>

                <FormControl fullWidth margin="normal">
                  <InputLabel id="title-select-label">Title</InputLabel>
                  <Field
                    as={Select}
                    name="title"
                    labelId="title-select-label"
                    label="Title"
                  >
                    <MenuItem value="Mr.">Mr.</MenuItem>
                    <MenuItem value="Mrs.">Mrs.</MenuItem>
                    <MenuItem value="Ms.">Ms.</MenuItem>
                    <MenuItem value="Dr.">Dr.</MenuItem>
                  </Field>
                  {errors.title && touched.title && (
                    <div className="text-red-500">{errors.title}</div>
                  )}
                </FormControl>

                <Field
                  as={TextField}
                  name="teacherName"
                  margin="dense"
                  label="Name"
                  fullWidth
                  variant="outlined"
                />
                {errors.teacherName && touched.teacherName && (
                  <div className="text-red-500">{errors.teacherName}</div>
                )}

                {signatureData && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="keep-signature-label">Signature</InputLabel>
                    <Select
                      labelId="keep-signature-label"
                      value={values.keepExistingSignature}
                      onChange={(e) => {
                        setFieldValue("keepExistingSignature", e.target.value);
                        if (e.target.value) {
                          setFieldValue("signature", null);
                        }
                      }}
                      label="Signature"
                    >
                      <MenuItem value={true}>Keep existing signature</MenuItem>
                      <MenuItem value={false}>Upload new signature</MenuItem>
                    </Select>
                  </FormControl>
                )}

{(!signatureData || !values.keepExistingSignature) && (
  <div>
    <input
      type="file"
      accept="image/*"
      onChange={(event) => {
        const file = event.currentTarget.files[0];
        setFieldValue("signature", file);
        if  (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFieldValue("signaturePreview", reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          setFieldValue("signaturePreview", null);
        }
      }}
      style={{ marginTop: "16px" }}
    />
    {values.signaturePreview && (
      <Box mt={2}>
        <Typography variant="subtitle1">Preview:</Typography>
        <img
          src={values.signaturePreview}
          alt="Signature Preview"
          style={{
            maxWidth: "100%",
            maxHeight: "200px",
            objectFit: "contain",
          }}
        />
      </Box>
    )}
  </div>
)}
                  
                {errors.signature && touched.signature && (
                  <div className="text-red-500">{errors.signature}</div>
                )}
                {signatureData && values.keepExistingSignature && (
                  <Zoom>
                    <CardMedia
                      component="img"
                      image={`${BACKEND_URL}/certificate/signatures/${signatureData.signature.signatureId}`}
                      alt="Signature"
                      sx={{
                        borderRadius: 2,
                        width: 120,
                        height: "auto",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        mt: 2,
                      }}
                    />
                  </Zoom>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="secondary">
                  Cancel
                </Button>
                <Button type="submit" color="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Filter and Search Section */}
      <div className="flex items-center mb-4 space-x-4">
        <FormControl variant="outlined">
          <InputLabel>Filter by Class</InputLabel>
          <Select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            label="Filter by Class"
          >
            <MenuItem value="all">All Classes</MenuItem>
            {classDetails?.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.className}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Search by Name or Email"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
        />
      </div>

      {filteredStudents.length === 0 ? (
        <Typography variant="body1" className="text-center mt-4 text-gray-500">
          No students found.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="bg-gray-100 font-bold">#</TableCell>
                <TableCell className="bg-gray-100 font-bold">
                  Student Name
                </TableCell>
                <TableCell className="bg-gray-100 font-bold">Email</TableCell>
                <TableCell className="bg-gray-100 font-bold">
                  Total Points
                </TableCell>
                <TableCell className="bg-gray-100 font-bold">
                  Certificate
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student, index) => (
                <TableRow
                  key={student._id}
                  className="hover:bg-gray-50 transition duration-300"
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{student.username}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.totalPoints} Points</TableCell>
                  <TableCell>
                    <IconButton>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default ManageCertificate;