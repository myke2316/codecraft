import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../LoginRegister/userSlice";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  useMediaQuery,
  useTheme,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AdminHeader from "./AdminHeader";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(!isMobile);
  const [dialogOpen, setDialogOpen] = useState(false); // For managing the logout confirmation dialog

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin-dashboard" },
    { text: "Manage Users", icon: <PeopleIcon />, path: "/admin-users" },
    { text: "Teacher Requests", icon: <SchoolIcon />, path: "/admin-teacherRequest" },
    { text: "Manage QnA", icon: <QuestionAnswerIcon />, path: "/admin-qna" },
  ];

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogoutClick = () => {
    setDialogOpen(true); // Open the confirmation dialog
  };

  const handleConfirmLogout = () => {
    dispatch(logout()); // Dispatch logout action
    setDialogOpen(false); // Close the confirmation dialog
    if (isMobile) toggleDrawer(); // Close the sidebar if on mobile
  };

  const handleCancelLogout = () => {
    setDialogOpen(false); // Close the confirmation dialog
  };

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? toggleDrawer : undefined}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              transition: "all 0.3s ease",
              "&.Mui-selected": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                "& .MuiListItemIcon-root": {
                  color: theme.palette.primary.contrastText,
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: location.pathname === item.path ? theme.palette.primary.contrastText : "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, transition: "opacity 0.3s ease" }} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem
          button
          onClick={handleLogoutClick} // Trigger confirmation dialog on logout click
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
            transition: "all 0.3s ease",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
            }}
          >
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0, transition: "opacity 0.3s ease" }} />
        </ListItem>
      </List>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCancelLogout}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">{"Are you sure you want to logout?"}</DialogTitle>
        <DialogContent dividers>
          You will be logged out of the system.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="secondary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return (
    <>
      <AdminHeader toggleDrawer={toggleDrawer} />
      <Box sx={{ display: "flex" }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={open}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: 240,
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                transition: "width 0.3s ease",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open={open}
            sx={{
              width: open ? 240 : 72,
              flexShrink: 0,
              transition: "width 0.3s ease",
              [`& .MuiDrawer-paper`]: {
                width: open ? 240 : 72,
                boxSizing: "border-box",
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                transition: "width 0.3s ease",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>
    </>
  );
};

export default AdminSidebar;
