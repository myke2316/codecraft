import React, { useState, useEffect } from "react";
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
import { removeStudentReducer, updateClass, updateClassNameReducer } from "./classSlice";
import { useGetAllUserMutation } from "../LoginRegister/userService";
import { useGetAllAnalyticsMutation } from "../Student/userAnalyticsService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

// Validation schema for Formik
const validationSchema = Yup.object({
  newClassName: Yup.string().required("Class Name is required"),
});

function TeacherEditClass() {
  const { classId } = useParams();
  const classes = useSelector((state) => state.class.class);
  const selectedClass = classes.find((classItem) => classItem._id === classId);
  const [updateClassName] = useUpdateClassMutation();
  const [fetchClassById] = useFetchClassByIdMutation();
  const [getAllUsers] = useGetAllUserMutation();
  const [getAllAnalytics] = useGetAllAnalyticsMutation();
  const [deleteClass] = useDeleteClassMutation(); // Assuming you have this mutation
  const navigate = useNavigate();
  const [initialClassName, setInitialClassName] = useState("");
  const [students, setStudents] = useState([]);
  const dispatch = useDispatch();
  const [removeStudent] = useRemoveStudentMutation();

  // States for dialogs
  const [openRemoveStudentDialog, setOpenRemoveStudentDialog] = useState(false);
  const [openDeleteClassDialog, setOpenDeleteClassDialog] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

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
      navigate(`/${classId}/class/classHome`); // Redirect back to the class page
    } catch (error) {
      toast.error(error?.data?.error || "Failed to update class name");
    }
  };

  const handleRemoveStudent = async () => {
    try {
      const data = await removeStudent({ classId, studentId: studentToRemove }).unwrap();
      console.log(data)
      setStudents(students.filter((student) => student._id !== studentToRemove));
      dispatch(updateClass({ classId, updatedClass: data.data }))
      toast.success("Student removed successfully!");
      setOpenRemoveStudentDialog(false); // Close the dialog
    } catch (error) {
      toast.error("Failed to remove student.");
    }
  };

  const handleDeleteClass = async () => {
    try {
      await deleteClass(classId).unwrap();
      toast.success("Class deleted successfully!");
      navigate("/classes"); // Redirect to a different page after deletion
    } catch (error) {
      toast.error("Failed to delete class.");
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
  };

  const handleCloseDeleteClassDialog = () => {
    setOpenDeleteClassDialog(false);
  };

  if (!selectedClass) {
    return (
      <div className="text-center text-red-600 mt-10">Class not found.</div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
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
              {students.length > 0 ? (
                <ul className="space-y-2">
                  {students.map((student) => (
                    <li
                      key={student._id}
                      className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                    >
                      <span className="font-medium">{student.username}</span>
                      <button
                        type="button"
                        onClick={() => handleOpenRemoveStudentDialog(student._id)}
                        className="text-red-600 font-semibold hover:text-red-800 transition duration-200"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-600">No students in this class.</div>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition duration-200"
              >
                Update Class Name
              </button>
              <button
                type="button"
                onClick={() => navigate(`/${classId}/class/classHome`)}
                className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-gray-700 transition duration-200"
              >
                Done
              </button>
              <button
                type="button"
                onClick={handleOpenDeleteClassDialog}
                className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700 transition duration-200"
              >
                Delete Class
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {/* Remove Student Confirmation Dialog */}
      <Dialog open={openRemoveStudentDialog} onClose={handleCloseRemoveStudentDialog}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to remove this student?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveStudentDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemoveStudent} color="secondary">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Class Confirmation Dialog */}
      <Dialog open={openDeleteClassDialog} onClose={handleCloseDeleteClassDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to delete this class?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteClassDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteClass} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TeacherEditClass;
