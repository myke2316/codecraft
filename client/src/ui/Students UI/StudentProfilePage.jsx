import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import {
  useLogoutMutation,
  useEditUsernameMutation,
} from "../../features/LoginRegister/userService";
import { logout, editUsername } from "../../features/LoginRegister/userSlice";
import { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Box,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";

function StudentProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userDetails);
  const [logoutApi] = useLogoutMutation();
  const [editUsernameApi] = useEditUsernameMutation();

  const [newUsername, setNewUsername] = useState(user.username || "");
  const [openDialog, setOpenDialog] = useState(false);

  async function handleLogout() {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      toast.success("Logout Successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  }

  async function handleEditUsername(e) {
    e.preventDefault();
    try {
      const response = await editUsernameApi({
        userId: user._id,
        newUsername,
      }).unwrap();
      dispatch(editUsername({ newUsername }));
      toast.success("Username updated successfully");
      setOpenDialog(false);
    } catch (error) {
      toast.error("Failed to update username. Please try again.");
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Card
        variant="outlined"
        sx={{
          p: 4,
          background: "linear-gradient(145deg, #f3f4f6, #ffffff)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
          borderRadius: "16px",
        }}
      >
        <CardContent>
          <Grid container spacing={4} alignItems="center">
            {/* Profile Picture */}
            <Grid item xs={12} sm={4} textAlign="center">
              <Avatar
                alt="Profile Picture"
                src={user.picture}
                sx={{ width: 120, height: 120, mx: "auto" }}
              />
            </Grid>

            {/* User Details */}
            <Grid item xs={12} sm={8}>
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                gutterBottom
              >
                {user.name || user.username || user.given_name}
              </Typography>

              <Typography variant="h6" color="textSecondary" gutterBottom>
                <strong>ID:</strong> {user._id}
              </Typography>

              <Typography variant="body1" color="textSecondary">
                <strong>Email:</strong> {user.email}
              </Typography>

              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                <strong>Role:</strong> {user.role}
              </Typography>

              {/* Edit Username Button */}
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  mr: 2,
                  background: "#4caf50",
                  "&:hover": { background: "#388e3c" },
                }}
              >
                Edit Username
              </Button>

              {/* Logout Button */}
              <Button
                variant="contained"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ background: "#f44336", "&:hover": { background: "#d32f2f" } }}
              >
                Logout
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog for editing username */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Username</DialogTitle>
        <DialogContent>
          <TextField
            label="New Username"
            variant="outlined"
            fullWidth
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: "#616161", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditUsername}
            sx={{
              background: "#1976d2",
              color: "#fff",
              "&:hover": { background: "#1565c0" },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default StudentProfilePage;
