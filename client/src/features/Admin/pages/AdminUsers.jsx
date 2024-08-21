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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  useDeleteUserMutation,
  useGetAllUserMutation,
} from "../../LoginRegister/userService";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all"); // State to hold the filter selection
  const [getAllUser] = useGetAllUserMutation();
  const [open, setOpen] = useState(false); // State to control dialog visibility
  const [selectedUser, setSelectedUser] = useState(null); // State to hold the user selected for deletion

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await getAllUser();
        // Filter users based on the selected role
        const filteredUsers = usersResponse.data.filter((user) => {
          if (roleFilter === "all") {
            // Exclude admins when 'all' is selected
            return user.role !== "admin";
          }
          return user.role === roleFilter;
        });
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, [getAllUser, roleFilter]); // Add roleFilter to dependency array

  const [userDelete, { isLoading: isLoadingDeleteUser }] =
    useDeleteUserMutation();

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleRemoveUser = async () => {
    try {
      if (selectedUser) {
        console.log(selectedUser._id)
        await userDelete(selectedUser._id);
        toast.success("Successfully deleted user!");
        setUsers(users.filter((user) => user._id !== selectedUser._id));
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const handleFilterChange = (event) => {
    setRoleFilter(event.target.value);
  };

  return (
    <Container maxWidth="lg">
      <FormControl fullWidth margin="normal">
        <InputLabel>Filter by Role</InputLabel>
        <Select
          value={roleFilter}
          onChange={handleFilterChange}
          label="Filter by Role"
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="teacher">Teachers</MenuItem>
          <MenuItem value="student">Students</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user._id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleOpenDialog(user)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-delete-dialog"
      >
        <DialogTitle id="confirm-delete-dialog">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone, and all associated data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleRemoveUser}
            color="secondary"
            variant="contained"
            disabled={isLoadingDeleteUser}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;
