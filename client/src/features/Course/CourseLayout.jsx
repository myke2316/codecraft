import React from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import CourseSidebar from "./Bar/CourseSideBar";
import { Box, AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function CourseLayout() {
  const navigate = useNavigate();
  const classId = useSelector(state => state.class.class._id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
      
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 0, 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Outlet />
        </Box>
      </Box>

      <ToastContainer />
    </Box>
  );
}

export default CourseLayout;