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
  TextField,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import {
  useApproveTeacherMutation,
  useDeclineTeacherMutation,
  useGetAllUserMutation,
} from "../../LoginRegister/userService";
import { toast } from "react-toastify";

const TeacherRequest = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("false"); // Add state for approval filter
  const [getAllUser] = useGetAllUserMutation();
  const [approveTeacher] = useApproveTeacherMutation();
  const [declineTeacher] = useDeclineTeacherMutation();
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllUser();
        // Fetch all teachers excluding approved ones
        const allTeachers = response.data.filter(
          (user) => user.role === "teacher" && user.approved !== "true"
        );
        setTeachers(allTeachers);
        // Initially filter by unapproved teachers
        const filteredTeachers = allTeachers.filter((teacher) => teacher.approved === "false");
        setFilteredTeachers(filteredTeachers);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchData();
  }, [getAllUser]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    const filtered = teachers.filter((teacher) =>
      teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  };

  const handleApprovalFilterChange = (e) => {
    setApprovalFilter(e.target.value);
    const filtered = teachers.filter((teacher) => teacher.approved === e.target.value);
    setFilteredTeachers(filtered);
  };

  const handleOpenDialog = (teacher, decline = false) => {
    setSelectedTeacher(teacher);
    setIsDeclining(decline);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedTeacher(null);
    setIsDeclining(false);
  };

  const handleApproveTeacher = async () => {
    try {
      if (selectedTeacher) {
        await approveTeacher({ userId: selectedTeacher._id });
        toast.success("Teacher approved successfully!");
        setTeachers(teachers.filter((teacher) => teacher._id !== selectedTeacher._id));
        setFilteredTeachers(filteredTeachers.filter((teacher) => teacher._id !== selectedTeacher._id));
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error approving teacher:", error);
      toast.error("Failed to approve teacher.");
    }
  };

  const handleDeclineTeacher = async () => {
    try {
      if (selectedTeacher) {
        await declineTeacher({ userId: selectedTeacher._id });
        toast.success("Teacher declined successfully!");
        setTeachers(teachers.filter((teacher) => teacher._id !== selectedTeacher._id));
        setFilteredTeachers(filteredTeachers.filter((teacher) => teacher._id !== selectedTeacher._id));
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error declining teacher:", error);
      toast.error("Failed to decline teacher.");
    }
  };

  return (
    <Container 
    maxWidth="lg" 
    sx={{ 
      mt: 4, 
      backgroundColor: 'white', 
      boxShadow: 3, // This applies a default shadow from MUI's theme
      borderRadius: 2, // Optional: adds rounded corners
      padding: 3
    }}
  >
      <Typography variant="h4" gutterBottom >
        Pending Teacher Requests
      </Typography>

      {/* Search and Filter Section */}
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label="Search by Username or Email"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mr: 2, flex: 1 }}
        />
        <Select
          value={approvalFilter}
          onChange={handleApprovalFilterChange}
          displayEmpty
          sx={{ mr: 2 }}
        >
          <MenuItem value="false">Not Approved</MenuItem>
          <MenuItem value="declined">Declined</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{bgcolor: 'rgb(110, 97, 171)', color: "white"}}>
              <TableCell sx={{color: "white"}}><Typography variant="subtitle2">ID</Typography></TableCell>
              <TableCell sx={{color: "white"}}><Typography variant="subtitle2">Username</Typography></TableCell>
              <TableCell sx={{color: "white"}}><Typography variant="subtitle2">Email</Typography></TableCell>
              <TableCell sx={{color: "white"}}><Typography variant="subtitle2">Actions</Typography></TableCell>
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
                      sx={{ textTransform: "none", mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleOpenDialog(teacher, true)}
                      sx={{ textTransform: "none" }}
                      disabled={teacher.approved === "declined"}
                    >
                      Decline
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

      {/* Approval/Decline Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-approve-decline-dialog"
      >
        <DialogTitle id="confirm-approve-decline-dialog">
          Confirm {isDeclining ? "Decline" : "Approval"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {isDeclining ? "decline" : "approve"} this teacher? This action will change their status to {isDeclining ? "declined" : "approved"}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={isDeclining ? handleDeclineTeacher : handleApproveTeacher}
            color="primary"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            {isDeclining ? "Decline" : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherRequest;
