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
  Typography,
  TextField,   // Import TextField for search input
  Box,
} from "@mui/material";
import {
  useApproveTeacherMutation,
  useGetAllUserMutation,
} from "../../LoginRegister/userService";
import { toast } from "react-toastify";

const TeacherRequest = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");  // State for search input
  const [getAllUser] = useGetAllUserMutation();
  const [approveTeacher] = useApproveTeacherMutation();
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllUser();
        console.log(response)
        const filteredTeachers = response.data.filter(
          (user) => user.role === "teacher" && !user.approved
        );
        setTeachers(filteredTeachers);
        setFilteredTeachers(filteredTeachers);  // Initialize with all teachers
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchData();
  }, [getAllUser]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search button click
  const handleSearch = () => {
    const filtered = teachers.filter((teacher) =>
      teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  };

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
        setFilteredTeachers(
          filteredTeachers.filter((teacher) => teacher._id !== selectedTeacher._id)
        );
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error approving teacher:", error);
      toast.error("Failed to approve teacher.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pending Teacher Requests
      </Typography>
      
      {/* Search Field and Button */}
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label="Search by Username or Email"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mr: 2, flex: 1 }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="subtitle2">ID</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Username</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Email</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <TableRow key={teacher._id} hover>
                  <TableCell>{teacher._id}</TableCell>
                  <TableCell>{teacher.username}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(teacher)}
                      sx={{ textTransform: "none" }}
                    >
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="h6" align="center" sx={{ py: 2 }}>
                    No pending teacher requests found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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
            Are you sure you want to approve this teacher? This action will change their status to approved.
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
            sx={{ textTransform: "none" }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherRequest;
