import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import {
  useLogoutMutation,
  useEditUsernameMutation,
} from "../../features/LoginRegister/userService";
import { logout, editUsername } from "../../features/LoginRegister/userSlice";
import {
  Container,
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
  useTheme,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Fade,
} from "@mui/material";
import { styled } from "@mui/system";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(145deg, #2c2c2c, #1e1e1e)' 
    : 'linear-gradient(145deg, #ffffff, #f0f0f0)',
  borderRadius: '16px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px 0 rgba(0, 0, 0, 0.5)'
    : '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 25px 0 rgba(0, 0, 0, 0.7)'
      : '0 6px 25px 0 rgba(0, 0, 0, 0.15)',
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  background: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.03)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)',
  },
}));

function TeacherProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
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
      await editUsernameApi({
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Fade in={true} timeout={800}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledPaper elevation={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                alt="Profile Picture"
                src={user.picture}
                sx={{ width: 150, height: 150, mb: 2, border: `4px solid #6e61ab` }}
              />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {user.username || (user.userData && user.userData.length > 0 && user.userData[0].username)}
              </Typography>
              <Tooltip title="Edit Username" arrow>
                <IconButton
                  color="#6e61ab"
                  onClick={() => setOpenDialog(true)}
                  sx={{ mt: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={8}>
            <StyledPaper elevation={3}>
              <Typography variant="h4" gutterBottom fontWeight="bold" color="#6e61ab">
                Teacher Profile
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <BadgeIcon sx={{ mr: 2, color: "#6e61ab" }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Teacher ID</Typography>
                      <Typography variant="body1">{user._id}</Typography>
                    </Box>
                  </InfoItem>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <EmailIcon sx={{ mr: 2,color: "#6e61ab" }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">{user.email}</Typography>
                    </Box>
                  </InfoItem>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <SchoolIcon sx={{ mr: 2, color: "#6e61ab" }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">Role</Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{user.role}</Typography>
                    </Box>
                  </InfoItem>
                </Grid>
              </Grid>
            
            </StyledPaper>
          </Grid>
        </Grid>
      </Fade>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          style: {
            borderRadius: '16px',
            padding: '16px',
          },
        }}
      >
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
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleEditUsername} 
            variant="contained" 
            color="primary"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TeacherProfilePage;