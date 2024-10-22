// // Login.js
// import { Formik } from "formik";
// import * as Yup from "yup";
// import LoginForm from "./LoginForm";
// import { useNavigate } from "react-router-dom";
// import { useLoginMutation } from "./userService";
// import { useDispatch } from "react-redux";
// import { setCredentials } from "./userSlice";
// import { toast } from "react-toastify";
// import { Button, Box, Typography } from "@mui/material";

// function Login() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [login] = useLoginMutation();

//   async function handleLogin(values) {
//     const { email, password } = values;
//     try {
//       const res = await login({ email, password }).unwrap();
//       dispatch(setCredentials({ ...res }));
//       toast.success("Login Successful");
//       navigate("/normal-redirect");
//     } catch (error) {
//       toast.error(error?.data?.error || error?.error);
//     }
//   }

//   function test() {
//     const storage = localStorage.getItem("userDetails");
//     console.log(storage);
//   }

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         minHeight: "70vh",
        
//       }}
//     >
//       <Typography variant="h3" component="h1" gutterBottom>
//         Login
//       </Typography>
//       <Formik
//         initialValues={{ email: "", password: "" }}
//         validationSchema={Yup.object({
//           email: Yup.string().email("Invalid Email").required("Email is Required"),
//           password: Yup.string().required("Password is Required"),
//         })}
//         onSubmit={handleLogin}
//       >
//         <LoginForm />
//       </Formik>

//     </Box>
//   );
// }

// export default Login;


import React from 'react';
import { Formik } from "formik";
import * as Yup from "yup";
import LoginForm from "./LoginForm";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "./userService";
import { useDispatch } from "react-redux";
import { setCredentials } from "./userSlice";
import { toast } from "react-toastify";
import { Box, Typography, Paper, useTheme, useMediaQuery } from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [login] = useLoginMutation();

  async function handleLogin(values) {
    const { email, password } = values;
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Login Successful");
      navigate("/normal-redirect");
    } catch (error) {
      toast.error(error?.data?.error || error?.error);
    }
  }

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
          maxWidth: '450px',
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
            Welcome Back
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#757575',
              textAlign: 'center',
              mb: 3,
            }}
          >
            Log in to continue your learning journey
          </Typography>
        </Box>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={Yup.object({
            email: Yup.string().email("Invalid Email").required("Email is Required"),
            password: Yup.string().required("Password is Required"),
          })}
          onSubmit={handleLogin}
        >
          <LoginForm />
        </Formik>
      </Paper>
    </Box>
  );
}

export default Login;