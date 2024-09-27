import React from "react";
import { Outlet } from "react-router";
import CourseSidebar from "./Bar/CourseSideBar"; 
import { Box } from "@mui/material";

function CourseContent() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CourseSidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 0, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'auto' ,width:'100%'}}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default CourseContent;