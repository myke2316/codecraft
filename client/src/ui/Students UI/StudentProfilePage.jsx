import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import {
  useLogoutMutation,
  useEditUsernameMutation,
  useDeleteUserMutation,
  usePermanentDeleteMutation,
} from "../../features/LoginRegister/userService";
import { Formik, Form, Field, ErrorMessage } from "formik";
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
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import PlayerDashboard from "../../features/Student/StudentDashboard/PlayerDashboard";
import CourseProgress from "../../features/Student/StudentDashboard/CourseProgress";
import * as Yup from "yup";
import { Delete } from "@mui/icons-material";
import { formatDate } from "../../utils/formatDate";
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, #2c2c2c, #1e1e1e)"
      : "linear-gradient(145deg, #ffffff, #f0f0f0)",
  borderRadius: "16px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 20px 0 rgba(0, 0, 0, 0.5)"
      : "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 6px 25px 0 rgba(0, 0, 0, 0.7)"
        : "0 6px 25px 0 rgba(0, 0, 0, 0.15)",
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: "8px",
  background:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.03)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    background:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
  },
}));

function StudentProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const user = useSelector((state) => state.user.userDetails);
  const [logoutApi] = useLogoutMutation();
  const [editUsernameApi] = useEditUsernameMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [userDelete] = useDeleteUserMutation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [permanentlyDeleteUser] = usePermanentDeleteMutation();
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
  // const handleRemoveUser = async () => {
  //   try {
  //     if (user) {
  //       const result = await userDelete(user._id).unwrap();
  //       toast.success("Successfully deleted user!");
  //       dispatch(logout());
  //       navigate("/login");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //     toast.error("Failed to delete user.");
  //   } finally {
  //     setOpenDeleteDialog(false); // Close the dialog
  //     setConfirmationText(""); // Reset confirmation text
  //   }
  // };

  const handleRemoveUser = async () => {
    try {
      await permanentlyDeleteUser(user._id).unwrap();
      toast.success("User permanently deleted!");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Error permanently deleting user:", error);
      toast.error("Failed to permanently delete user.");
    } finally {
      setOpenDeleteDialog(false); // Close the dialog
      setConfirmationText(""); // Reset confirmation text
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setConfirmationStep(1);
    setConfirmationText("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setStudentToRemove(null);
    setConfirmationStep(1);
    setConfirmationText("");
  };

  const handleNextStep = () => {
    setConfirmationStep(2);
  };

  const handleConfirmationTextChange = (event) => {
    setConfirmationText(event.target.value);
  };

  async function handleEditUsername(values) {
    const { givenName, middleInitial, lastName } = values;
    const newUsername = middleInitial
      ? `${givenName} ${middleInitial.toUpperCase()} ${lastName}`
      : `${givenName} ${lastName}`;
    try {
      await editUsernameApi({
        userId: user._id,
        newUsername,
      }).unwrap();
      dispatch(editUsername({ newUsername }));
      toast.success("Username updated successfully");
      setOpenDialog(false);
    } catch (error) {
      console.log(error);
      toast.error(error.data.error);
    }
  }

  const validationSchema = Yup.object().shape({
    givenName: Yup.string()
      .matches(
        /^[A-Za-z]+(?:[-'\s][A-Za-z]+)*$/,
        "Please enter a valid given name (e.g., 'John', 'Mary-Jane', 'Maria Alexandria')"
      )
      .min(2, "Given name must be at least 2 characters long")
      .max(20, "Given name must be at most 30 characters long")
      .required("Given name is required"),
    middleInitial: Yup.string()
      .matches(
        /^[A-Za-z]?$/,
        "Please enter a valid middle initial (e.g., 'A', 'B') or leave blank"
      )
      .max(1, "Middle initial must be a single letter")
      .notRequired(),
    lastName: Yup.string()
      .matches(
        /^[A-Za-z]+(?:[-'\s][A-Za-z]+)*$/,
        "Please enter a valid last name (e.g., 'Castillo', 'De La Cruz')"
      )
      .min(2, "Last name must be at least 2 characters long")
      .max(20, "Last name must be at most 25 characters long")
      .required("Last name is required"),
  });

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
      }}
    >
      <Fade in={true} timeout={800}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledPaper
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                alt="Profile Picture"
                src={user.picture}
                sx={{
                  width: 150,
                  height: 150,
                  mb: 2,
                  border: `4px solid #6e61ab`,
                }}
              />
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {user.username ||
                  (user.userData &&
                    user.userData.length > 0 &&
                    user.userData[0].username)}
              </Typography>
              <Tooltip title="Edit Username" arrow>
                <IconButton
                  color="#6e61ab"
                  onClick={() => setOpenDialog(true)}
                  sx={{ mt: 1 }}
                  disabled={
                    user.isDeleted ||
                    user?.[0]?.isDeleted ||
                    user?.userData?.[0]?.isDeleted
                  }
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              {user.isDeleted ||
              user?.[0]?.isDeleted ||
              user?.userData?.[0]?.isDeleted ? (
                <Alert severity="error">
                  Account will be deleted at{" "}
                  {formatDate(user.deleteExpiresAt) ||
                    formatDate(user?.[0]?.deleteExpiresAt) ||
                    formatDate(user?.userData?.[0]?.deleteExpiresAt)}
                </Alert>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setOpenDeleteDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Delete Account
                </Button>
              )}
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={8}>
            <StyledPaper elevation={3}>
              <Typography
                variant="h4"
                gutterBottom
                fontWeight="bold"
                color="#6e61ab"
              >
                Student Profile
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <BadgeIcon sx={{ mr: 2, color: "#6e61ab" }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Student ID
                      </Typography>
                      <Typography variant="body1">{user._id}</Typography>
                    </Box>
                  </InfoItem>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <EmailIcon sx={{ mr: 2, color: "#6e61ab" }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1">{user.email}</Typography>
                    </Box>
                  </InfoItem>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <SchoolIcon sx={{ mr: 2, color: "#6e61ab" }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Role
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {user.role}
                      </Typography>
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
            borderRadius: "16px",
            padding: "16px",
          },
        }}
      >
        <DialogTitle>Edit Username</DialogTitle>
        <Formik
          initialValues={{
            givenName: "",
            middleInitial: "",
            lastName: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleEditUsername}
        >
          {({ errors, touched }) => (
            <Form>
              <DialogContent>
                <Field name="givenName">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="New Given Name"
                      variant="outlined"
                      fullWidth
                      error={touched.givenName && !!errors.givenName}
                      helperText={touched.givenName && errors.givenName}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Field>
                <Field name="middleInitial">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="New Middle Initial"
                      variant="outlined"
                      fullWidth
                      error={touched.middleInitial && !!errors.middleInitial}
                      helperText={touched.middleInitial && errors.middleInitial}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Field>
                <Field name="lastName">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="New Last Name"
                      variant="outlined"
                      fullWidth
                      error={touched.lastName && !!errors.lastName}
                      helperText={touched.lastName && errors.lastName}
                      sx={{ mt: 2 }}
                    />
                  )}
                </Field>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Submit
                </Button>
              </DialogContent>
            </Form>
          )}
        </Formik>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleEditUsername}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be
            undone.{" "}
            <Alert severity="error">All of your data will be removed.</Alert>{" "}
            Please type the confirmation text to proceed deleting the account.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Type DELETEACCOUNTCONFIRMATION"
            type="text"
            fullWidth
            variant="outlined"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRemoveUser}
            color="error"
            disabled={confirmationText !== "DELETEACCOUNTCONFIRMATION"}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <CourseProgress />
    </Container>
  );
}

export default StudentProfilePage;
