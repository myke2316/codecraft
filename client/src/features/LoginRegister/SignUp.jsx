// import { Formik } from "formik";
// import SignUpForm from "./SignUpForm";
// import * as Yup from "yup";
// import { Link, useNavigate } from "react-router-dom";
// import { useRegisterMutation } from "./userService";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { setCredentials } from "./userSlice";
// import { useEffect } from "react";
// import { useGetCourseDataMutation } from "../Class/courseService";
// import { setCourse } from "../Class/courseSlice";
// import { Box, Typography, Button } from "@mui/material";

// function SignUp() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [register] = useRegisterMutation();
//   const userDetails = useSelector((state) => state.user.userDetails);

//   const [fetchCourseData] = useGetCourseDataMutation();

//   async function handleRegister(values) {
//     const { emailaddress, username, password, role } = values;

//     try {
//       const res = await register({
//         email: emailaddress,
//         username,
//         password,
//         role,
//       }).unwrap();
//       dispatch(setCredentials({ ...res }));
//       fetchCourse();
//     } catch (error) {
//       toast.error(error?.data?.error || error?.error);
//     }
//   }

//   async function fetchCourse() {
//     try {
//       const courseData = await fetchCourseData().unwrap();
//       dispatch(setCourse(courseData || []));
//     } catch (error) {
//       toast.error(error?.response?.data?.message || error.message);
//     }
//   }

//   useEffect(() => {
//     if (userDetails) {
//       if (userDetails.role === "student") {
//         toast.success("Register Complete!");
//         navigate(`/${userDetails._id}`);
//       } else {
//         toast.success("Register Complete!");
//         navigate(`/classes`);
//       }
//     }
//   }, [userDetails]);

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         minHeight: "80vh",
//       }}
//     >
//       <Typography variant="h3" component="h1" gutterBottom>
//         Sign Up
//       </Typography>

//       <Formik
//         initialValues={{
//           emailaddress: "",
//           username: "",
//           password: "",
//           role: "",
//           confirmpassword: "",
//         }}
//         validationSchema={Yup.object({
//           emailaddress: Yup.string()
//             .email("Invalid Email")
//             .required("Email is Required"),
//           username: Yup.string()
//             .matches(/^[a-zA-Z\s]+$/, "Only letters are allowed.")
//             .min(5, "Username too short")
//             .max(40, "Username too long")
//             .required("Username is Required"),
//           password: Yup.string()
//             .min(8, "Password too short")
//             .max(20, "Password too long")
//             .required("Password is Required"),
//           confirmpassword: Yup.string()
//             .oneOf([Yup.ref("password"), null], "Passwords do not match")
//             .required("Confirm Password is Required"),
//           role: Yup.string().required("Role is Required"),
//         })}
//         onSubmit={handleRegister}
//       >
//         <SignUpForm />
//       </Formik>

//       <Typography variant="body1" sx={{ mt: 2 }}>
//         Already have an account?{" "}
//         <Link to="/login" style={{ color: "blue" }}>
//           Login here
//         </Link>
//       </Typography>
//     </Box>
//   );
// }

// export default SignUp;
import React, { useEffect } from 'react';
import { Formik } from "formik";
import SignUpForm from "./SignUpForm";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "./userService";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setCredentials } from "./userSlice";
import { useGetCourseDataMutation } from "../Class/courseService";
import { setCourse } from "../Class/courseSlice";
import { Box, Typography, Paper, useTheme, useMediaQuery } from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [register] = useRegisterMutation();
  const userDetails = useSelector((state) => state.user.userDetails);

  const [fetchCourseData] = useGetCourseDataMutation();

  async function handleRegister(values) {
    const { emailaddress, username, password, role } = values;

    try {
      const res = await register({
        email: emailaddress,
        username,
        password,
        role,
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      fetchCourse();
    } catch (error) {
      toast.error(error?.data?.error || error?.error);
    }
  }

  async function fetchCourse() {
    try {
      const courseData = await fetchCourseData().unwrap();
      dispatch(setCourse(courseData || []));
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }

  useEffect(() => {
    if (userDetails) {
      if (userDetails.role === "student") {
        toast.success("Register Complete!");
        navigate(`/${userDetails._id}`);
      } else {
        toast.success("Register Complete!");
        navigate(`/classes`);
      }
    }
  }, [userDetails, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
   
        padding: theme.spacing(3),
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: theme.spacing(4, 3),
          width: '100%',
          maxWidth: '500px',
          borderRadius: '12px',
          backgroundColor: 'white',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: '#3f51b5', mb: 2 }} />
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              color: '#1a237e',
              fontWeight: 700,
              textAlign: 'center',
              mb: 1,
            }}
          >
            Join Our Learning Community
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#757575',
              textAlign: 'center',
              mb: 3,
            }}
          >
            Create an account to start your learning journey
          </Typography>
        </Box>

        <Formik
          initialValues={{
            emailaddress: "",
            username: "",
            password: "",
            role: "",
            confirmpassword: "",
          }}
          validationSchema={Yup.object({
            emailaddress: Yup.string()
              .email("Invalid Email")
              .required("Email is Required"),
            username: Yup.string()
            .matches(/^[a-zA-Z]+( [a-zA-Z]+)*$/, "Only letters and single spaces between words are allowed.")
              .min(5, "Full name too short")
              .max(70, "Full name too long")
              .required("Username is Required"),
            password: Yup.string()
              .min(8, "Password too short")
              .max(20, "Password too long")
              .required("Password is Required"),
            confirmpassword: Yup.string()
              .oneOf([Yup.ref("password"), null], "Passwords do not match")
              .required("Confirm Password is Required"),
            role: Yup.string().required("Role is Required"),
          })}
          onSubmit={handleRegister}
        >
          <SignUpForm />
        </Formik>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#3f51b5",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Log in here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default SignUp;