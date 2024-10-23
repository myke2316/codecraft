import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../LoginRegister/userService";
import { toast } from "react-toastify";
import { logout } from "../../LoginRegister/userSlice";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
  Avatar,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  Home as HomeIcon,
  QuestionAnswer as QnAIcon,
  Code as PlaygroundIcon,
  Person as ProfileIcon,
  ExitToApp as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  School as ClassIcon,
  Brightness4,
  Brightness7,
  Article,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../../../utils/formatDate";

const drawerVariants = {
  open: { width: 240, transition: { duration: 0.3 } },
  closed: { width: 60, transition: { duration: 0.3 } },
};

export default function AuthorizedSidebar({
  open,
  setOpen,
  toggleTheme,
  mode,
}) {
  const userInfo = useSelector((state) => state.user.userDetails);
  const userId = userInfo._id;
  const dispatch = useDispatch();
  const userClass = useSelector((state) => state.class.class);
  const classes = !userClass ? [] : userClass.length === 0;
  const navigate = useNavigate();
  const [logoutApi] = useLogoutMutation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isVerySmall = useMediaQuery("(max-height: 500px)");
  const isSmalls = useMediaQuery("(max-width: 1024px)");
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (isSmalls) {
      setOpen(false); // Close the drawer if the screen is small
    }
  }, [isSmalls, setOpen]);

  async function handleLogout() {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      toast.success("Logout Successfully");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }

  const classData = useSelector((state) => state.class.class);


  const getMenuItems = () => {
    let items = [];

    if (userInfo.role === "student" && !classes) {
      items = [
        {
          text: "Home",
          icon: <HomeIcon />,
          link: `/studentClass/${classData._id}/classHome`,
        },
        {
          text: "Forum",
          icon: <QnAIcon />,
          link: `/qna/${userId}`,
          onClick: () => navigate(`/qna/${userId}`),
        },
        {
          text: "Playground",
          icon: <PlaygroundIcon />,
          link: `/playground/${userId}`,
        },
      ];
    } else if (userInfo.role === "student" && classes) {
      items = [{ text: "Home", icon: <HomeIcon />, link: "/" }];
    } else if (
      userInfo.role === "teacher" &&
      (userInfo.approved === "true"|| userInfo?.userData?.[0]?.approved=== "true")
    ) {
      items = [
        { text: "Classes", icon: <ClassIcon />, link: "/classes" },
        { text: "Manage Certificate", icon: <Article />, link: "/certificate/teacher/manage" },
        {
          text: "Forum",
          icon: <QnAIcon />,
          link: `/qna/${userId}`,
          onClick: () => navigate(`/qna/${userId}`),
        },
        {
          text: "Playground",
          icon: <PlaygroundIcon />,
          link: `/playground/${userId}`,
          onClick: () => navigate(`/playground/${userId}`),
        },
      ];
    } else if (userInfo.role === "teacher" && !userInfo.approved) {
      items = [{ text: "Classes", icon: <ClassIcon />, link: "/classes" }];
    }

    items.push(
      { text: "Profile", icon: <ProfileIcon />, link: "/profile" },
      { text: "Logout", icon: <LogoutIcon />, onClick: handleLogout }
    );

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <motion.div
      initial={false}
      animate={open ? "open" : "closed"}
      variants={drawerVariants}
    >
      <Drawer
        variant={isMobile ? "permanent" : "permanent"}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: open ? 240 : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? 240 : 60,
            boxSizing: "border-box",
            backgroundColor: mode === "light" ? "#ffffff" : "#1e1e1e",
            color: mode === "light" ? "#333333" : "#ecf0f1",
            borderRight: "1px solid",
            borderColor: mode === "light" ? "#e0e0e0" : "#1e1e1e",
            boxShadow: "5px 0 15px rgba(0, 0, 0, 0.3)",
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Box sx={{ padding: "16px", textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{
              color: mode === "light" ? "#333333" : "#ecf0f1",
              fontWeight: "light",
              fontFamily: "Poppins, sans-serif",
              fontSize: open ? "1.5rem" : "1rem",
              transition: "font-size 0.3s ease",
            }}
          >
            <span
              className="font-medium"
              style={{ color: mode === "light" ? "#3f0081" : "#928fce" }}
            >
              &lt;
            </span>
            {open ? "CodeCraft" : ""}
            <span
              className="font-medium"
              style={{ color: mode === "light" ? "#3f0081" : "#928fce" }}
            >
              /&gt;
            </span>
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: mode === "light" ? "#fff2ff" : "#000" }} />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={userInfo.picture}
                  alt={userInfo.username}
                  sx={{ width: 60, height: 60, mb: 1 }}
                />
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {userInfo.username ||
                      (userInfo.userData &&
                        userInfo.userData.length > 0 &&
                        userInfo.userData[0].username)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        mode === "light" ? "text.secondary" : "text.primary",
                    }}
                  >
                    {userInfo.role}
                  </Typography>
                </Box>
              </Box>
              <Divider
                sx={{ bgcolor: mode === "light" ? "#e0e0e0" : "#000" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <List>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={item.text}
              component={item.onClick ? "div" : Link}
              to={item.link}
              onClick={item.onClick}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
                "&:hover": {
                  backgroundColor: mode === "light" ? "#f5f5f5" : "#34495e",
                  borderRadius: "10px",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                  color: mode === "light" ? "#3f0081" : "#928fce",
                  transition: "all 0.3s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 500,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider sx={{ bgcolor: mode === "light" ? "#e0e0e0" : "#000" }} />
        {/* <Box sx={{ p: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={mode === "dark"}
                onChange={toggleTheme}
                icon={<Brightness7 />}
                checkedIcon={<Brightness4 />}
              />
            }
            label={
              <Typography
                sx={{ fontFamily: "Poppins, sans-serif", fontSize: "0.875rem" }}
              >
                {mode === "dark" ? "Dark Mode" : "Light Mode"}
              </Typography>
            }
          />
        </Box> */}
        {userInfo.isDeleted && (
          <Alert severity="warning">
          <AlertTitle>Account Deletion Notice</AlertTitle>
          Your account has been marked for deletion and will be permanently deleted in <strong>{formatDate(userInfo.deleteExpiresAt)}</strong> (15 days). 
          Please contact support if you think this is an error.
        </Alert>
        )}
      </Drawer>
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          display: isSmalls && "none",
          position: "fixed",
          left: open ? "240px" : "60px",
          top: isVerySmall ? "90%" : "50%",
          transform: "translateY(-50%)",
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: mode === "light" ? "#6e61ab" : "#6e61ab",
          color: mode === "light" ? "#ecf0f1" : "#ecf0f1",
          "&:hover": {
            backgroundColor: mode === "light" ? "#e0e0e0" : "#aab1e5",
          },
          transition: "all 0.3s ease",
        }}
      >
        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>
    </motion.div>
  );
}
