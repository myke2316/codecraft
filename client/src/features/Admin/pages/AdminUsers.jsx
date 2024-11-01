import React, { useCallback, useEffect, useState } from "react";
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
  Box,
  TablePagination,
} from "@mui/material";
import {
  useDeleteUserMutation,
  useGetAllUserMutation,
  usePermanentDeleteMutation,
  useUndeleteUserMutation,
} from "../../LoginRegister/userService";
import { toast } from "react-toastify";

export default function Component() {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [getAllUser] = useGetAllUserMutation();
  const [open, setOpen] = useState(false);
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDelete] = useDeleteUserMutation();
  const [userUndelete] = useUndeleteUserMutation();
  const [permanentlyDeleteUser] = usePermanentDeleteMutation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deletedPage, setDeletedPage] = useState(0);
  const [deletedRowsPerPage, setDeletedRowsPerPage] = useState(5);

  const fetchUsers = useCallback(async () => {
    try {
      const usersResponse = await getAllUser();
      const activeUsers = usersResponse.data.filter((user) => !user.isDeleted);
      const removedUsers = usersResponse.data.filter((user) => user.isDeleted);
  
      setUsers(activeUsers);
      setDeletedUsers(removedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [getAllUser]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleOpenPermanentDeleteDialog = (user) => {
    setSelectedUser(user);
    setPermanentDeleteOpen(true);
  };

  const handleClosePermanentDeleteDialog = () => {
    setPermanentDeleteOpen(false);
    setSelectedUser(null);
  };

  const handlePermanentlyDeleteUser = async () => {
    try {
      await permanentlyDeleteUser(selectedUser._id).unwrap();
      toast.success("User permanently deleted!");
      setDeletedUsers(deletedUsers.filter((user) => user._id !== selectedUser._id));
      handleClosePermanentDeleteDialog();
    } catch (error) {
      console.error("Error permanently deleting user:", error);
      toast.error("Failed to permanently delete user.");
    }
  };

  const handleRemoveUser = async () => {
    try {
      if (selectedUser) {
        const result = await userDelete(selectedUser._id).unwrap();
        toast.success("Successfully deleted user!");
        setUsers(users.filter((user) => user._id !== selectedUser._id));
        setDeletedUsers((prevDeletedUsers) => [
          ...prevDeletedUsers,
          { ...result.user, isDeleted: true },
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
      const restoredUser = deletedUsers.find((user) => user._id === userId);
      setDeletedUsers(deletedUsers.filter((user) => user._id !== userId));
      setUsers((prevUsers) => [
        ...prevUsers,
        { ...restoredUser, isDeleted: false },
      ]);
      fetchUsers();
    } catch (error) {
      console.error("Error restoring user:", error);
      toast.error("Failed to restore user.");
    }
  };

  const handleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
    setPage(0);
    setDeletedPage(0);
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole =
      roleFilter === "all"
        ? user.role !== "admin"
        : roleFilter === "no_role"
        ? !user.role
        : user.role === roleFilter;
    const matchesSearch = user.username.toLowerCase().includes(searchQuery);
    return matchesRole && matchesSearch;
  });

  const filteredDeletedUsers = deletedUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery)
  );

  const getRemainingTime = useCallback((deleteExpiresAt) => {
    if (!deleteExpiresAt) return "N/A";
    const now = new Date();
    const expiresAt = new Date(deleteExpiresAt);
    const timeDiff = expiresAt - now;

    if (timeDiff <= 0) return "Expired";

    const seconds = Math.floor((timeDiff / 1000) % 60);
    const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDeletedPage = (event, newPage) => {
    setDeletedPage(newPage);
  };

  const handleChangeDeletedRowsPerPage = (event) => {
    setDeletedRowsPerPage(parseInt(event.target.value, 10));
    setDeletedPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ p: 4, mt: 4, backgroundColor: 'background.paper', boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom sx={{padding: 3}}>
        Manage Users
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Search by Username"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
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
              <MenuItem value="no_role">No Role</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Active Users
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{bgcolor: 'primary.main', color: "white"}}>
              <TableCell sx={{color: "white"}}>ID</TableCell>
              <TableCell sx={{color: "white"}}>Username</TableCell>
              <TableCell sx={{color: "white"}}>Email</TableCell>
              <TableCell sx={{color: "white"}}>Role</TableCell>
              <TableCell sx={{color: "white"}} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user._id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role || "No Role"}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="primary"
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length -1}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Deleted Users
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3}}>
        <Table>
          <TableHead>
            <TableRow sx={{bgcolor: 'primary.main', color: "white"}}>
              <TableCell sx={{color: "white"}}>ID</TableCell>
              <TableCell sx={{color: "white"}}>Username</TableCell>
              <TableCell sx={{color: "white"}}>Email</TableCell>
              <TableCell sx={{color: "white"}}>Role</TableCell>
              <TableCell sx={{color: "white"}}>Time Until Deletion</TableCell>
              <TableCell sx={{color: "white"}} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeletedUsers.length > 0 ? (
              filteredDeletedUsers
                .slice(deletedPage * deletedRowsPerPage, deletedPage * deletedRowsPerPage + deletedRowsPerPage)
                .map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user._id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {getRemainingTime(user.deleteExpiresAt)}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" alignItems="center">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleRestoreUser(user._id)}
                        >
                          Restore
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleOpenPermanentDeleteDialog(user)}
                          sx={{ ml: 2 }}
                        >
                          Delete
                        </Button>
                      </Box>
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDeletedUsers.length}
        rowsPerPage={deletedRowsPerPage}
        page={deletedPage}
        onPageChange={handleChangeDeletedPage}
        onRowsPerPageChange={handleChangeDeletedRowsPerPage}
      />

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-delete-dialog"
      >
        <DialogTitle id="confirm-delete-dialog">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleRemoveUser}
            color="primary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={permanentDeleteOpen}
        onClose={handleClosePermanentDeleteDialog}
        aria-labelledby="confirm-permanent-delete-dialog"
      >
        <DialogTitle id="confirm-permanent-delete-dialog">Warning: Permanent Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to permanently delete this user. This action cannot be undone, and all associated data will be irretrievably lost. Are you absolutely sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermanentDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handlePermanentlyDeleteUser}
            color="error"
            variant="contained"
          >
            Permanently Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}