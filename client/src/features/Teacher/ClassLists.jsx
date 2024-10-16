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
} from "@mui/material";
import { logout } from "../LoginRegister/userSlice";

const ClassLists = () => {
  const userInfo = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [fetchClassById, { data: classes, isLoading, error }] =
    useFetchClassMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [openDialog, setOpenDialog] = useState(false);

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Classes</h1>
      {classes && classes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Link to={`/${classItem._id}/class/classHome`} key={classItem._id}>
              <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-gray-700">
                  {classItem.className}
                </h2>
                <p className="text-sm text-gray-500">
                  Invite Code: {classItem.inviteCode}
                </p>
                <p className="text-sm text-gray-500">
                  Students: {classItem.students.length}
                </p>
              </div>
            </Link>
          ))}
          <div
            onClick={() => navigate("/create-class")}
            className="flex items-center justify-center bg-white shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            <div className="text-center">
              <p className="text-5xl text-gray-400 font-bold">+</p>
              <p className="text-lg text-gray-600 mt-2">Add New Class</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-600">You have not created any classes yet.</p>
          <div
            onClick={() => navigate("/create-class")}
            className="flex items-center justify-center bg-white shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            <div className="text-center">
              <p className="text-5xl text-gray-400 font-bold">+</p>
              <p className="text-lg text-gray-600 mt-2">Add New Class</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClassLists;
