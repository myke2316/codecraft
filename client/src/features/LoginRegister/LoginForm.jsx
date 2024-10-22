// import { ErrorMessage, Field, Form, useFormikContext } from "formik";
// import { useEffect, useState } from "react";
// import { Box, Button, TextField, IconButton, InputAdornment, Typography } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import { useLoginMutation, useForgotPasswordMutation } from "./userService";
// import { toast } from "react-toastify";
// import { Link } from "react-router-dom";
// import { BACKEND_URL } from "../../constants";

// function LoginForm() {
//   const [login] = useLoginMutation();
//   const [forgotPassword] = useForgotPasswordMutation();
//   const [showPassword, setShowPassword] = useState(false);

//   const { values } = useFormikContext();

//   // Handling Google OAuth login
//   const handleGoogleAuth = () => {
//     window.location.href = `${BACKEND_URL}/auth/google/callback`;
//   };

//   // Handling Forgot Password
//   const [isCooldown, setIsCooldown] = useState(false);
//   const [countdown, setCountdown] = useState(60); // 60 seconds countdown
//   const [loading, setLoading] = useState(false); // Loading state

//   useEffect(() => {
//     const storedCountdown = localStorage.getItem('countdown');
//     const storedIsCooldown = localStorage.getItem('isCooldown');

//     if (storedIsCooldown === 'true' && storedCountdown) {
//       setIsCooldown(true);
//       setCountdown(Number(storedCountdown));
//     }
//   }, []);

//   const handleForgotPassword = async () => {
//     if (!values.email) {
//       toast.error("Please enter an email!");
//       return;
//     }

//     setLoading(true); // Start loading
//     try {
//       const response = await forgotPassword({ email: values.email }).unwrap();
//       toast.success(response.message);
//       setIsCooldown(true);
//       setCountdown(60);
//       localStorage.setItem('isCooldown', 'true');
//       localStorage.setItem('countdown', 60);
//     } catch (error) {
//       toast.error(error?.data?.message || error?.error);
//     } finally {
//       setLoading(false); // Stop loading
//     }
//   };

//   useEffect(() => {
//     let timer;
//     if (isCooldown && countdown > 0) {
//       timer = setInterval(() => {
//         setCountdown(prev => {
//           const newCountdown = prev - 1;
//           localStorage.setItem('countdown', newCountdown);
//           return newCountdown;
//         });
//       }, 1000);
//     } else if (countdown === 0) {
//       setIsCooldown(false);
//       localStorage.removeItem('isCooldown');
//       localStorage.removeItem('countdown');
//     }
//     return () => clearInterval(timer);
//   }, [isCooldown, countdown]);

//   return (
//     <Form>
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           gap: "20px",
//           width: "100%",
//           maxWidth: "500px", // Increased max width for wider input fields
//         }}
//       >
//         {/* Email Field */}
//         <Field name="email">
//           {({ field, meta }) => (
//             <TextField
//               {...field}
//               label="Email Address"
//               fullWidth
//               sx={{
//                 width: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width, wider on larger screens
//               }}
//               error={meta.touched && !!meta.error}
//               helperText={meta.touched && meta.error ? meta.error : ""}
//             />
//           )}
//         </Field>

//         {/* Password Field with View/Hide Toggle */}
//         <Field name="password">
//           {({ field, meta }) => (
//             <TextField
//               {...field}
//               type={showPassword ? "text" : "password"}
//               label="Password"
//               fullWidth
//               sx={{
//                 width: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width, wider on larger screens
//               }}
//               error={meta.touched && !!meta.error}
//               helperText={meta.touched && meta.error ? meta.error : ""}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton
//                       onClick={() => setShowPassword((prev) => !prev)}
//                       edge="end"
//                     >
//                       {showPassword ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           )}
//         </Field>

//         {/* Submit and Google Login Buttons */}
//         <Box sx={{ display: "flex", gap: "10px", justifyContent: "center", width: "100%" }}>
//   <Button
//     type="submit"
//     variant="outlined"
//     fullWidth
//     sx={{
//       maxWidth: "600px", // Match the input field width
//       borderRadius: "5px",
//       padding: "15px 0", // Increased padding for a larger button
//       border: "2px solid", // Border with pastel rainbow colors
//       borderImageSlice: 1,
//       borderImageSource:
//         "linear-gradient(90deg,  #DF8F52, #4189E4, #FEEB33)", // Light pastel rainbow gradient
//       color: "black", // Button text color
//       fontWeight: "bold",
//       "&:hover": {
//         borderImageSource:
//           "linear-gradient(90deg, #DF8F52, #4189E4, #FEEB33)",
//       },
//     }}
//   >
//     Login
//   </Button>

//   <Button
//     variant="outlined"
//     onClick={handleGoogleAuth}
//     fullWidth
//     sx={{
//       maxWidth: "600px", // Match the input field width
//       borderRadius: "5px",
//       padding: "15px 0", // Increased padding for a larger button
//       border: "2px solid", // Border with pastel rainbow colors
//       borderImageSlice: 1,
//       borderImageSource:
//         "linear-gradient(90deg, #fbc2eb, #a6c1ee, #b2f9fc, #fbd786)", // Light pastel rainbow gradient
//       color: "black", // Button text color
//       fontWeight: "bold",
//       "&:hover": {
//         borderImageSource:
//           "linear-gradient(90deg, #fbd786, #b2f9fc, #a6c1ee, #fbc2eb)",
//       },
//     }}
//   >
//     Login with Google
//   </Button>
// </Box>

//         {/* Forgot Password and Signup Links */}
//         <Typography>
//   Forgot Password?{" "}
//   <span
//       style={{
//         color: isCooldown || loading ? "#ccc" : "#FFC300", // Grey out when on cooldown or loading
//         fontWeight: "bold",
//         textDecoration: "underline",
//         cursor: isCooldown || loading ? "not-allowed" : "pointer",
//         transition: "color 0.3s ease",
//       }}
//       onClick={!isCooldown && !loading ? handleForgotPassword : null}
//       onMouseEnter={(e) => (e.target.style.color = "#FF5733")} // Changes to orange on hover
//       onMouseLeave={(e) => (e.target.style.color = isCooldown || loading ? "#ccc" : "#FFC300")} // Back to yellow or grey on mouse leave
//     >
//       {loading ? "Sending..." : isCooldown ? `Please wait ${countdown} seconds` : "Click here"}
//     </span>
// </Typography>

// <Typography>
//   Don't have an account?{" "}
//   <Link
//     to="/signup"
//     style={{
//       color: "#66FCF1", // Bright teal color for initial state
//       fontWeight: "bold",
//       textDecoration: "underline",
//       transition: "color 0.3s ease, font-size 0.3s ease",
//     }}
//     onMouseEnter={(e) => {
//       e.target.style.color = "#45A29E"; // Darken color on hover
//       e.target.style.fontSize = "110%"; // Slightly enlarge font on hover
//     }}
//     onMouseLeave={(e) => {
//       e.target.style.color = "#66FCF1"; // Back to original teal color
//       e.target.style.fontSize = "100%"; // Back to original size
//     }}
//   >
//     Signup Now!
//   </Link>
// </Typography>

//       </Box>
//     </Form>
//   );
// }

// export default LoginForm;


import React, { useEffect, useState } from 'react';
import { ErrorMessage, Field, Form, useFormikContext } from "formik";
import { Box, Button, TextField, IconButton, InputAdornment, Typography, Divider } from "@mui/material";
import { Visibility, VisibilityOff, Google as GoogleIcon, Login as LoginIcon } from "@mui/icons-material";
import { useLoginMutation, useForgotPasswordMutation } from "./userService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../constants";

function LoginForm() {
  const [login] = useLoginMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);

  const { values } = useFormikContext();

  const handleGoogleAuth = () => {
    window.location.href = `${BACKEND_URL}/auth/google/callback`;
  };

  useEffect(() => {
    const storedCountdown = localStorage.getItem('countdown');
    const storedIsCooldown = localStorage.getItem('isCooldown');

    if (storedIsCooldown === 'true' && storedCountdown) {
      setIsCooldown(true);
      setCountdown(Number(storedCountdown));
    }
  }, []);

  const handleForgotPassword = async () => {
    if (!values.email) {
      toast.error("Please enter an email!");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email: values.email }).unwrap();
      toast.success(response.message);
      setIsCooldown(true);
      setCountdown(60);
      localStorage.setItem('isCooldown', 'true');
      localStorage.setItem('countdown', '60');
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (isCooldown && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          const newCountdown = prev - 1;
          localStorage.setItem('countdown', newCountdown.toString());
          return newCountdown;
        });
      }, 1000);
    } else if (countdown === 0) {
      setIsCooldown(false);
      localStorage.removeItem('isCooldown');
      localStorage.removeItem('countdown');
    }
    return () => clearInterval(timer);
  }, [isCooldown, countdown]);

  return (
    <Form>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "100%",
        }}
      >
        <Field name="email">
          {({ field, meta }) => (
            <TextField
              {...field}
              label="Email Address"
              fullWidth
              variant="outlined"
              error={meta.touched && !!meta.error}
              helperText={meta.touched && meta.error ? meta.error : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton edge="start" disabled>
                      <LoginIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#3f51b5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#303f9f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a237e',
                  },
                },
              }}
            />
          )}
        </Field>

        <Field name="password">
          {({ field, meta }) => (
            <TextField
              {...field}
              type={showPassword ? "text" : "password"}
              label="Password"
              fullWidth
              variant="outlined"
              error={meta.touched && !!meta.error}
              helperText={meta.touched && meta.error ? meta.error : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton edge="start" disabled>
                      <LoginIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#3f51b5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#303f9f',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1a237e',
                  },
                },
              }}
            />
          )}
        </Field>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          startIcon={<LoginIcon />}
          sx={{
            mt: 2,
            borderRadius: "5px",
            padding: "12px 0",
            backgroundColor: '#3f51b5',
            '&:hover': {
              backgroundColor: '#303f9f',
            },
          }}
        >
          Login
        </Button>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Button
          variant="outlined"
          onClick={handleGoogleAuth}
          fullWidth
          startIcon={<GoogleIcon />}
          sx={{
            borderRadius: "5px",
            padding: "12px 0",
            borderColor: '#3f51b5',
            color: '#3f51b5',
            '&:hover': {
              backgroundColor: 'rgba(63, 81, 181, 0.04)',
              borderColor: '#303f9f',
            },
          }}
        >
          Login with Google
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2">
            <span
              style={{
                color: isCooldown || loading ? "#ccc" : "#3f51b5",
                fontWeight: "bold",
                cursor: isCooldown || loading ? "not-allowed" : "pointer",
                transition: "color 0.3s ease",
              }}
              onClick={!isCooldown && !loading ? handleForgotPassword : null}
            >
              {loading ? "Sending..." : isCooldown ? `Wait ${countdown}s` : "Forgot Password?"}
            </span>
          </Typography>

          <Typography variant="body2">
            <Link
              to="/signup"
              style={{
                color: "#3f51b5",
                fontWeight: "bold",
                textDecoration: "none",
                transition: "color 0.3s ease",
              }}
            >
              Create Account
            </Link>
          </Typography>
        </Box>
      </Box>
    </Form>
  );
}

export default LoginForm;