import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  useFetchClassByIdMutation,
  useFetchClassMutation,
} from "./classService";
import { setClass } from "./classSlice";
import { useUpdateRoleMutation } from "../LoginRegister/userService";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { logout } from "../LoginRegister/userSlice";
import {
  Add as AddIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  ContentCopy as ContentCopyIcon,
  Check,
  ArrowForward,
} from "@mui/icons-material";
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion(Card);
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

const ClassLists = () => {
  const userInfo = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fetchClassById, { data: classes, isLoading, error }] = useFetchClassMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchClasses = async () => {
      if (userInfo && userInfo.role === "teacher") {
        try {
          const data = await fetchClassById(userInfo._id);
          dispatch(setClass(data.data));
        } catch (error) {
          console.error("Error fetching classes:", error);
        }
      }
    };

    fetchClasses();
  }, [fetchClassById, userInfo, dispatch]);

  const handleChangeRole = async () => {
    try {
      await updateRole({ userId: userInfo._id, role: "student" });
      toast.success("Role changed to student.");
      dispatch(logout());
      navigate("/login");
      setOpenDialog(false);
    } catch (error) {
      toast.error("Error changing role.");
      console.error("Error changing role:", error);
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleCopyInviteCode = (inviteCode, classId) => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedId(classId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!userInfo || userInfo.role !== "teacher") {
    return (
      <Box className="text-center text-red-600 mt-10">
        <Typography variant="h6">You do not have permission to view this page.</Typography>
      </Box>
    );
  }

  if (
    userInfo?.approved === "false" ||
    userInfo?.userData?.[0]?.approved === "false" ||
    userInfo?.approved === "declined" ||
    userInfo?.userData?.[0]?.approved === "declined"
  ) {
    return (
      <Box className="text-center text-gray-600 mt-10">
        <Typography variant="body1">
          {userInfo.approved === "false" ||
          userInfo?.userData?.[0]?.approved === "false"
            ? "Waiting for approval"
            : "Request Declined, Please change role to student if you want to keep the account."}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          className="mt-4"
        >
          Change Role to Student
        </Button>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Confirm Role Change</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to change your role to student? This action
              is not reversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleChangeRole} color="secondary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.log(error);
    return (
      <Box className="text-center text-red-600 mt-10">
        <Typography variant="h6">Error loading classes.</Typography>
      </Box>
    );
  }

  return (
    <Box className="p-6 min-h-screen">
      <Typography
        variant="h4"
        component="h1"
        className="mb-6 text-gray-800 font-bold"
      >
        Your Classes
      </Typography>
      <Grid container spacing={3}>
        {classes && classes.length > 0 ? (
          classes.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem._id}>
              <MotionCard
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                component={Link}
                to={`/${classItem._id}/class/classHome`}
                sx={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  background: theme.palette.background.paper,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <MotionBox
                  sx={{
                    background: `linear-gradient(135deg, 	#6e61ab 0%, 	#4b3987 100%)`,
                    color: "#fff",
                    p: 4,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: "-50%",
                      left: "-50%",
                      width: "200%",
                      height: "200%",
                      background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
                      transform: "rotate(30deg)",
                    },
                  }}
                >
                  <MotionTypography 
                    variant="h5" 
                    component="div" 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    sx={{ fontWeight: "bold", mb: 2, position: "relative" }}
                  >
                    {classItem?.className?.substring(0, 10) + "..."}
                  </MotionTypography>
                  <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
                    <Tooltip title={copiedId === classItem._id ? "Copied!" : "Copy Invite Code"} arrow>
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          handleCopyInviteCode(classItem.inviteCode, classItem._id);
                        }}
                        size="small"
                        sx={{ 
                          color: "#fff",
                          bgcolor: alpha(theme.palette.background.paper, 0.2),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.background.paper, 0.3),
                          }
                        }}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={copiedId === classItem._id ? 'check' : 'copy'}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                          >
                            {copiedId === classItem._id ? <Check /> : <ContentCopyIcon />}
                          </motion.div>
                        </AnimatePresence>
                      </IconButton>
                    </Tooltip>
                    <Typography variant="body2" sx={{ ml: 1, color: "rgba(255, 255, 255, 0.8)" }}>
                      Invite Code: {classItem.inviteCode}
                    </Typography>
                  </Box>
                </MotionBox>
                <CardContent sx={{ bgcolor: "#fff", p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box display="flex" flexDirection="column" gap={2} mb={2}>
                    <Box display="flex" alignItems="center">
                      <PeopleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="body1">
                        <strong>{classItem.students.length}</strong> Students
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <SchoolIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                      <Typography variant="body1">
                        View Class Details
                      </Typography>
                    </Box>
                  </Box>
                  <MotionBox 
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    sx={{ 
                      mt: 'auto', 
                      p: 2, 
                      bgcolor: theme.palette.grey[100], 
                      borderRadius: "8px",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Manage class
                    </Typography>
                    <ArrowForward sx={{ color: theme.palette.primary.main }} />
                  </MotionBox>
                </CardContent>
              </MotionCard>
            </Grid>
          ))
        ) : null}
        <Grid item xs={12} sm={6} md={4}>
          <MotionCard
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            onClick={() => navigate("/create-class")}
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
              background: theme.palette.background.paper,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CardContent className="text-center">
              <AddIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" color="primary">
                Add New Class
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClassLists;