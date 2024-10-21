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
  Button,  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  Box,
} from "@mui/material";
import { logout } from "../LoginRegister/userSlice";
import { Add as AddIcon, School as SchoolIcon, People as PeopleIcon, VpnKey as VpnKeyIcon } from '@mui/icons-material';
import { useTheme } from "@emotion/react";
const ClassLists = () => {
  const userInfo = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fetchClassById, { data: classes, isLoading, error }] =
    useFetchClassMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [openDialog, setOpenDialog] = useState(false);
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
      setOpenDialog(false); // Close the dialog after successful role change
    } catch (error) {
      toast.error("Error changing role.");
      console.error("Error changing role:", error);
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  if (!userInfo || userInfo.role !== "teacher") {
    return (
      <div className="text-center text-red-600 mt-10">
        You do not have permission to view this page.
      </div>
    );
  }
  console.log(userInfo?.userData?.[0]?.approved);
  if ((userInfo?.approved === "false" || userInfo?.userData?.[0]?.approved === "false") ||(userInfo?.approved === "declined" || userInfo?.userData?.[0]?.approved === "declined") ) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <p>{userInfo.approved === "false" || userInfo?.userData?.[0]?.approved === "false" ? "Waiting for approval" : "Request Declined, Please change role to student if you want to keep the account."}</p>
       
        <button
          onClick={handleOpenDialog}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Change Role to Student
        </button>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Confirm Role Change</DialogTitle>
          <DialogContent>
            <p>
              Are you sure you want to change your role to student? This action
              is not reversible.
            </p>
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
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center text-gray-600 mt-10">Loading...</div>;
  }

  if (error) {
    console.log(error);
    return (
      <div className="text-center text-red-600 mt-10">
        Error loading classes.
      </div>
    );
  }

  return (
    // <div className="p-6">
    //   <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Classes</h1>
    //   {classes && classes.length > 0 ? (
    //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    //       {classes.map((classItem) => (
    //         <Link to={`/${classItem._id}/class/classHome`} key={classItem._id}>
    //           <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
    //             <h2 className="text-xl font-semibold text-gray-700">
    //               {classItem.className}
    //             </h2>
    //             <p className="text-sm text-gray-500">
    //               Invite Code: {classItem.inviteCode}
    //             </p>
    //             <p className="text-sm text-gray-500">
    //               Students: {classItem.students.length}
    //             </p>
    //           </div>
    //         </Link>
    //       ))}
    //       <div
    //         onClick={() => navigate("/create-class")}
    //         className="flex items-center justify-center bg-white shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    //       >
    //         <div className="text-center">
    //           <p className="text-5xl text-gray-400 font-bold">+</p>
    //           <p className="text-lg text-gray-600 mt-2">Add New Class</p>
    //         </div>
    //       </div>
    //     </div>
    //   ) : (
    //     <>
    //       <p className="text-gray-600">You have not created any classes yet.</p>
    //       <div
    //         onClick={() => navigate("/create-class")}
    //         className="flex items-center justify-center bg-white shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    //       >
    //         <div className="text-center">
    //           <p className="text-5xl text-gray-400 font-bold">+</p>
    //           <p className="text-lg text-gray-600 mt-2">Add New Class</p>
    //         </div>
    //       </div>
    //     </>
    //   )}
    // </div>
    <Box className="p-6 min-h-screen">
      <Typography variant="h4" component="h1" className="mb-6 text-gray-800 font-bold">
        Your Classes
      </Typography>
      {classes && classes.length > 0 ? (
        <Grid container spacing={3}>
          {classes.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem._id}>
              <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                <CardActionArea 
                  component={Link} 
                  to={`/${classItem._id}/class/classHome`}
                  className="h-full"
                >
                  <CardContent className="h-full flex flex-col justify-between">
                    <Box>
                      <Typography variant="h6" component="h2" className="mb-2 text-gray-700">
                        {classItem.className}
                      </Typography>
                      <Box className="flex items-center mb-1">
                        <VpnKeyIcon className="text-gray-500 mr-2" fontSize="small" />
                        <Typography variant="body2" color="textSecondary">
                          Invite Code: {classItem.inviteCode}
                        </Typography>
                      </Box>
                      <Box className="flex items-center">
                        <PeopleIcon className="text-gray-500 mr-2" fontSize="small" />
                        <Typography variant="body2" color="textSecondary">
                          Students: {classItem.students.length}
                        </Typography>
                      </Box>
                    </Box>
                    <Box className="mt-4">
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        startIcon={<SchoolIcon />}
                        fullWidth
                      >
                        View Class
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              className="h-full hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => navigate("/create-class")}
            >
              <CardActionArea className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <AddIcon className="text-6xl text-gray-400 mb-2" />
                  <Typography variant="h6" color="textSecondary">
                    Add New Class
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Box className="text-center">
          <Typography variant="body1" color="textSecondary" className="mb-4">
            You have not created any classes yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/create-class")}
            size="large"
          >
            Create Your First Class
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ClassLists;
