import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import JoinClassForm from "../../features/Student/JoinClassForm";
import StudentClassContainer from "./StudentClassContainer";
import { useNavigate } from "react-router";

function StudentClass() {
  const [open, setOpen] = useState(false);
  const userClass = useSelector((state) => state.class.class);
  const classes = !userClass ? [] : userClass.length === 0;
  const navigate = useNavigate();
  // Determine if the user has no classes
  const hasClasses = Array.isArray(userClass) && userClass.length > 0;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function redirectStudent() {
    navigate(`/studentClass/${userClass._id}`);
  }

  return (
    <Container className="text-black" maxWidth="md">
      {!classes ? (
        <StudentClassContainer />
        // redirectStudent()
      ) : (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Typography variant="h4" gutterBottom>
            No Classes Available
          </Typography>
          <Typography variant="body1" paragraph>
            You haven't joined any classes yet. Please join a class to get
            started.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpen}>
            + Join a Class
          </Button>

          {/* Dialog for JoinClassForm */}
          <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Join a Class</DialogTitle>
            <DialogContent>
              <JoinClassForm />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </Container>
  );
}

export default StudentClass;
