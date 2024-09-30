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
  useUndeleteUserMutation, // Import the undelete user mutation
} from "../../LoginRegister/userService";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const [users, setUsers] = useState([]); // Active users
  const [deletedUsers, setDeletedUsers] = useState([]); // Deleted users
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [getAllUser] = useGetAllUserMutation();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDelete, { isLoading: isLoadingDeleteUser }] = useDeleteUserMutation();
  const [userUndelete, { isLoading: isLoadingUndeleteUser }] = useUndeleteUserMutation(); // Use undelete mutation

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const usersResponse = await getAllUser();
      const activeUsers = usersResponse.data.filter((user) => !user.isDeleted); // Filter out deleted users
      const removedUsers = usersResponse.data.filter((user) => user.isDeleted); // Filter only deleted users

      setUsers(activeUsers); // Set active users
      setDeletedUsers(removedUsers); // Set deleted users
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

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
        await userDelete(selectedUser._id).unwrap(); // Use unwrap to get the result directly
        toast.success("Successfully deleted user!");
        
        // Update local state to reflect the change
        setUsers(users.filter((user) => user._id !== selectedUser._id)); // Remove from active users
        setDeletedUsers((prevDeletedUsers) => [
          ...prevDeletedUsers,
          { ...selectedUser, isDeleted: true }, // Add to deleted users
        ]);

        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await userUndelete(userId).unwrap();
      toast.success("User restored successfully!");

      // Update local state to reflect the restoration
      const restoredUser = deletedUsers.find((user) => user._id === userId);
      setDeletedUsers(deletedUsers.filter((user) => user._id !== userId)); // Remove from deleted users
      setUsers((prevUsers) => [...prevUsers, { ...restoredUser, isDeleted: false }]); // Add back to active users

      fetchUsers(); // Optionally re-fetch if necessary
    } catch (error) {
      console.error("Error restoring user:", error);
      toast.error("Failed to restore user.");
    }
  };

  const handleFilterChange = (event) => {
    setRoleFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery)
  );

  const filteredDeletedUsers = deletedUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery)
  );

  // Function to calculate remaining time until deletion
  const getRemainingTime = (deleteExpiresAt) => {
    const now = new Date();
    const expiresAt = new Date(deleteExpiresAt);
    const timeDiff = expiresAt - now;

    if (timeDiff <= 0) return "Expired";

    const seconds = Math.floor((timeDiff / 1000) % 60);
    const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

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
      <Typography variant="h5" gutterBottom>
        Active Users
      </Typography>
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

      {/* Deleted Users Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Deleted Users
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Time Until Deletion</TableCell> {/* New column for time remaining */}
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeletedUsers.length > 0 ? (
              filteredDeletedUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user._id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {getRemainingTime(user.deleteExpiresAt)} {/* Calculate remaining time */}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleRestoreUser(user._id)} // Restore user
                      disabled={isLoadingUndeleteUser}
                    >
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No deleted users found.
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
        <DialogTitle id="confirm-delete-dialog">Confirm Delete</DialogTitle>
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
