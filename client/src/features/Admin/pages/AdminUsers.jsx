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
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import {
  useDeleteUserMutation,
  useGetAllUserMutation,
} from "../../LoginRegister/userService";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all"); // State to hold the filter selection
  const [searchQuery, setSearchQuery] = useState(""); // State to hold the search query
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
            return user.role !== "admin"; // Exclude admins when 'all' is selected
          }
          return user.role === roleFilter;
        });
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, [getAllUser, roleFilter]);

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
        console.log(selectedUser._id);
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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Filter users based on the search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>

      {/* Search and Filter Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          {/* Search Filter */}
          <TextField
            fullWidth
            label="Search by Username"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          {/* Role Filter */}
          <FormControl fullWidth variant="outlined">
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              onChange={handleFilterChange}
              label="Filter by Role"
            >
              <MenuItem value="all">All (Exclude Admin)</MenuItem>
              <MenuItem value="teacher">Teachers</MenuItem>
              <MenuItem value="student">Students</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* User Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user._id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleOpenDialog(user)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
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
            Are you sure you want to delete this user? This action cannot be
            undone, and all associated data will be permanently deleted.
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
