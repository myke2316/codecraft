import React, { useState, useEffect, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  useUpdateClassMutation,
  useFetchClassByIdMutation,
  useRemoveStudentMutation,
  useDeleteClassMutation,
} from "./classService";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  removeStudentReducer,
  updateClass,
  updateClassNameReducer,
} from "./classSlice";
import { useGetAllUserMutation } from "../LoginRegister/userService";
import { useGetAllAnalyticsMutation } from "../Student/userAnalyticsService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Pagination,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const validationSchema = Yup.object({
  newClassName: Yup.string()
    .required("Class Name is required")
    .max(25, "Class Name cannot exceed 25 characters.")
    .matches(
      /^[a-zA-Z0-9 ]*$/,
      "Class name can only contain letters, numbers, and spaces"
    ),
});

function TeacherEditClass() {
  const { classId } = useParams();
  const classes = useSelector((state) => state.class.class);
  const selectedClass = classes.find((classItem) => classItem._id === classId);
  const [updateClassName] = useUpdateClassMutation();
  const [fetchClassById] = useFetchClassByIdMutation();
  const [getAllUsers] = useGetAllUserMutation();
  const [getAllAnalytics] = useGetAllAnalyticsMutation();
  const [deleteClass] = useDeleteClassMutation();
  const navigate = useNavigate();
  const [initialClassName, setInitialClassName] = useState("");
  const [students, setStudents] = useState([]);
  const dispatch = useDispatch();
  const [removeStudent] = useRemoveStudentMutation();

  const [openRemoveStudentDialog, setOpenRemoveStudentDialog] = useState(false);
  const [openDeleteClassDialog, setOpenDeleteClassDialog] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [confirmationText, setConfirmationText] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const classResponse = await fetchClassById(classId).unwrap();
        const userResponse = await getAllUsers().unwrap();
        const analyticsResponse = await getAllAnalytics().unwrap();

        const studentDetails = classResponse.students
          .map((studentId) => {
            const student = userResponse.find((user) => user._id === studentId);
            if (student) {
              const analytics = analyticsResponse.find(
                (analytic) => analytic.userId === studentId
              );
              const totalPoints = analytics
                ? analytics.coursesAnalytics.reduce(
                    (total, course) => total + course.totalPointsEarned,
                    0
                  )
                : 0;

              const totalTimeSpent = analytics
                ? analytics.coursesAnalytics.reduce(
                    (total, course) => total + course.totalTimeSpent,
                    0
                  )
                : 0;

              return {
                ...student,
                totalPointsEarned: totalPoints,
                totalTimeSpent: totalTimeSpent,
                badges: analytics ? analytics.badges : [],
              };
            }
            return null;
          })
          .filter(Boolean);

        setStudents(studentDetails);
        setInitialClassName(classResponse.className);
      } catch (error) {
        toast.error("Failed to load class details or students.");
      }
    };

    if (classId) {
      fetchClassDetails();
    }
  }, [classId, fetchClassById, getAllUsers, getAllAnalytics]);

  const handleUpdateClassName = async (values) => {
    try {
      const { newClassName } = values;
      const data = await updateClassName({ classId, newClassName }).unwrap();
      dispatch(
        updateClassNameReducer({
          classId: data._id,
          newClassName: data.className,
        })
      );
      toast.success("Class name updated successfully!");
      navigate(`/${classId}/class/classHome`);
    } catch (error) {
      toast.error(error?.data?.error || "Failed to update class name");
    }
  };

  const handleRemoveStudent = async () => {
    if (confirmationText === "REMOVESTUDENTFROMCLASS") {
      try {
        const data = await removeStudent({
          classId,
          studentId: studentToRemove,
        }).unwrap();
        setStudents(
          students.filter((student) => student._id !== studentToRemove)
        );
        dispatch(updateClass({ classId, updatedClass: data.data }));
        toast.success("Student removed successfully!");
        setConfirmationStep(1);
        setConfirmationText("");
        setOpenRemoveStudentDialog(false);
      } catch (error) {
        toast.error("Failed to remove student.");
      }
    } else {
      toast.error("Incorrect confirmation text. Please try again.");
    }
  };

  const handleDeleteClass = async () => {
    if (confirmationText === "DELETECLASSPERMANENTLY") {
      try {
        await deleteClass(classId).unwrap();
        toast.success("Class deleted successfully!");
        navigate("/classes");
      } catch (error) {
        toast.error("Failed to delete class.");
      }
    } else {
      toast.error("Incorrect confirmation text. Please try again.");
    }
  };

  const handleOpenRemoveStudentDialog = (studentId) => {
    setStudentToRemove(studentId);
    setOpenRemoveStudentDialog(true);
  };

  const handleCloseRemoveStudentDialog = () => {
    setOpenRemoveStudentDialog(false);
    setStudentToRemove(null);
  };

  const handleOpenDeleteClassDialog = () => {
    setOpenDeleteClassDialog(true);
    setConfirmationStep(1);
    setConfirmationText("");
  };

  const handleCloseDeleteClassDialog = () => {
    setOpenDeleteClassDialog(false);
    setConfirmationStep(1);
    setConfirmationText("");
  };

  const handleNextStep = () => {
    setConfirmationStep(2);
  };

  const handleConfirmationTextChange = (event) => {
    setConfirmationText(event.target.value);
  };

  const filteredAndSortedStudents = useMemo(() => {
    let studentsToDisplay = students.filter((student) =>
      student.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key) {
      studentsToDisplay.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return studentsToDisplay;
  }, [students, searchQuery, sortConfig]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredAndSortedStudents.slice(
      startIndex,
      startIndex + rowsPerPage
    );
  }, [filteredAndSortedStudents, page, rowsPerPage]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (!selectedClass) {
    return (
      <div className="text-center text-red-600 mt-10">Class not found.</div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Edit Class</h1>
      <Formik
        initialValues={{ newClassName: initialClassName }}
        validationSchema={validationSchema}
        onSubmit={handleUpdateClassName}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <label
                htmlFor="newClassName"
                className="block text-lg font-medium text-gray-700"
              >
                New Class Name
              </label>
              <Field
                type="text"
                name="newClassName"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <ErrorMessage
                name="newClassName"
                component="div"
                className="text-red-400 text-sm mt-1"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">Students</h2>
              <div className="flex items-center mb-4">
                <TextField
                  variant="outlined"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mr-2"
                  InputProps={{
                    startAdornment: (
                      <SearchIcon className="text-gray-400 mr-2" />
                    ),
                  }}
                />
              </div>
              {paginatedStudents.length > 0 ? (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{ bgcolor: "rgb(110, 97, 171)", color: "white" }}
                        >
                          <TableCell>
                            <TableSortLabel
                              active={sortConfig.key === "username"}
                              direction={
                                sortConfig.key === "username"
                                  ? sortConfig.direction
                                  : "asc"
                              }
                              onClick={() => requestSort("username")}
                              sx={{ color: "white" }}
                            >
                              Username
                            </TableSortLabel>
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>Email</TableCell>
                          
                          <TableCell sx={{ color: "white" }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedStudents.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell>{student.username}</TableCell>
                            <TableCell>{student.email}</TableCell>
                          
                           
                            <TableCell>
                              <Button
                                onClick={() =>
                                  handleOpenRemoveStudentDialog(student._id)
                                }
                                color="secondary"
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <div className="flex justify-center mt-4">
                    <Pagination
                      count={Math.ceil(
                        filteredAndSortedStudents.length / rowsPerPage
                      )}
                      page={page}
                      onChange={handleChangePage}
                      color="primary"
                    />
                  </div>
                </>
              ) : (
                <div className="text-gray-600">No students in this class.</div>
              )}
            </div>
            <div
      className="flex flex-col md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4"
      style={{ padding: '1rem' }} // Add padding for better spacing
    >
      <Button
        type="submit"
        disabled={isSubmitting}
        variant="contained"
        sx={{
          backgroundColor: "#6e61ab", // Set custom background color
          color: "#fff", // Optional: Set text color for better contrast
          padding: '12px',
          fontSize: { xs: '0.9rem', md: '1rem' },
          '&:hover': {
            backgroundColor: "#8f9ed8", // Optional: Darker shade on hover
          },
        }}
      >
        Update Class Name
      </Button>
      <Button
        onClick={() => navigate(`/${classId}/class/classHome`)}
        variant="contained"
        sx={{
          backgroundColor: "#4b3987", // Set custom background color
          color: "#fff", // Optional: Set text color for better contrast
          padding: '12px',
          fontSize: { xs: '0.9rem', md: '1rem' },
          '&:hover': {
            backgroundColor: "#8f9ed8", // Optional: Darker shade on hover
          },
        }}
      >
        Done
      </Button>
      <Button
        onClick={handleOpenDeleteClassDialog}
        variant="contained"
        sx={{
          backgroundColor: "	#6e61ab", // Set custom background color
          color: "#fff", // Optional: Set text color for better contrast
          padding: '12px',
          fontSize: { xs: '0.9rem', md: '1rem' },
          '&:hover': {
            backgroundColor: "#8f9ed8", // Optional: Darker shade on hover
          },
        }}
      >
        Delete Class
      </Button>
    </div>
          </Form>
        )}
      </Formik>

      <Dialog
        open={openRemoveStudentDialog}
        onClose={handleCloseRemoveStudentDialog}
      >
        <DialogTitle>
          {confirmationStep === 1 ? "Confirm Removal" : "Final Confirmation"}
        </DialogTitle>
        <DialogContent>
          {confirmationStep === 1 ? (
            <Typography variant="body1">
              Are you sure you want to remove this student from the class?
            </Typography>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                To confirm removing the student, please type
                "REMOVESTUDENTFROMCLASS" below:
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                fullWidth
                value={confirmationText}
                onChange={handleConfirmationTextChange}
                variant="outlined"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveStudentDialog} color="primary">
            Cancel
          </Button>
          {confirmationStep === 1 ? (
            <Button
              onClick={handleNextStep}
              color="secondary"
              variant="contained"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleRemoveStudent}
              color="secondary"
              variant="contained"
              disabled={confirmationText !== "REMOVESTUDENTFROMCLASS"}
            >
              Remove Student
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteClassDialog}
        onClose={handleCloseDeleteClassDialog}
      >
        <DialogTitle>
          {confirmationStep === 1
            ? "Confirm Class Deletion"
            : "Final Confirmation"}
        </DialogTitle>
        <DialogContent>
          {confirmationStep === 1 ? (
            <Typography variant="body1">
              Are you sure you want to delete this class? This action cannot be
              undone.
            </Typography>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                To confirm deleting the class, please type
                "DELETECLASSPERMANENTLY" below:
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                fullWidth
                value={confirmationText}
                onChange={handleConfirmationTextChange}
                variant="outlined"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteClassDialog} color="primary">
            Cancel
          </Button>
          {confirmationStep === 1 ? (
            <Button
              onClick={handleNextStep}
              color="secondary"
              variant="contained"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleDeleteClass}
              color="secondary"
              variant="contained"
              disabled={confirmationText !== "DELETECLASSPERMANENTLY"}
            >
              Delete Class
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TeacherEditClass;
