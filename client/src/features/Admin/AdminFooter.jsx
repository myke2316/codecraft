import React from "react";
import { Box, Typography } from "@mui/material";

const AdminFooter = () => {
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
      <Typography variant="body2" color="text.secondary" align="center">
        &copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.
      </Typography>
    </Box>
  );
};

export default AdminFooter;