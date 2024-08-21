import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  useApproveTeacherMutation,
  useGetAllUserMutation,
} from "../../LoginRegister/userService"; // Assuming you have these mutations
import { toast } from "react-toastify";

const TeacherRequest = () => {
  const [teachers, setTeachers] = useState([]);
  const [getAllUser] = useGetAllUserMutation();
  const [approveTeacher] = useApproveTeacherMutation();
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllUser();
        const filteredTeachers = response.data.filter(
          (user) => user.role === "teacher" && !user.approved
        );
        setTeachers(filteredTeachers);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchData();
  }, [getAllUser]);

  const handleOpenDialog = (teacher) => {
    setSelectedTeacher(teacher);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedTeacher(null);
  };

  const handleApproveTeacher = async () => {
    try {
      if (selectedTeacher) {
        await approveTeacher({ userId: selectedTeacher._id });
        toast.success("Teacher approved successfully!");
        setTeachers(
          teachers.filter((teacher) => teacher._id !== selectedTeacher._id)
        );
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error approving teacher:", error);
      toast.error("Failed to approve teacher.");
    }
  };

  return (
    <Container maxWidth="lg">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher._id}>
                <TableCell>{teacher._id}</TableCell>
                <TableCell>{teacher.username}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog(teacher)}
                  >
                    Approve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-approve-dialog"
      >
        <DialogTitle id="confirm-approve-dialog">Confirm Approval</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this teacher? This action will
            change their status to approved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleApproveTeacher}
            color="primary"
            variant="contained"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherRequest;
