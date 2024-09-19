import { ErrorMessage, Field, Form, useFormikContext } from "formik";
import { useState } from "react";
import { Box, Button, TextField, IconButton, InputAdornment, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLoginMutation, useForgotPasswordMutation } from "./userService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../constants";

function LoginForm() {
  const [login] = useLoginMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);

  const { values } = useFormikContext();

  // Handling Google OAuth login
  const handleGoogleAuth = () => {
    window.location.href = `${BACKEND_URL}/auth/google/callback`;
  };

  // Handling Forgot Password
  const handleForgotPassword = async () => {
    if (!values.email) {
      toast.error("Please enter an email!");
      return;
    }
    try {
      const response = await forgotPassword({ email: values.email }).unwrap();
      toast.success(response.message);
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  };

  return (
    <Form>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          width: "100%",
          maxWidth: "500px", // Increased max width for wider input fields
        }}
      >
        {/* Email Field */}
        <Field name="email">
          {({ field, meta }) => (
            <TextField
              {...field}
              label="Email Address"
              fullWidth
              sx={{
                width: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width, wider on larger screens
              }}
              error={meta.touched && !!meta.error}
              helperText={meta.touched && meta.error ? meta.error : ""}
            />
          )}
        </Field>

        {/* Password Field with View/Hide Toggle */}
        <Field name="password">
          {({ field, meta }) => (
            <TextField
              {...field}
              type={showPassword ? "text" : "password"}
              label="Password"
              fullWidth
              sx={{
                width: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width, wider on larger screens
              }}
              error={meta.touched && !!meta.error}
              helperText={meta.touched && meta.error ? meta.error : ""}
              InputProps={{
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
            />
          )}
        </Field>

        {/* Submit and Google Login Buttons */}
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "center", width: "100%" }}>
  <Button
    type="submit"
    variant="outlined"
    fullWidth
    sx={{
      maxWidth: "600px", // Match the input field width
      borderRadius: "5px",
      padding: "15px 0", // Increased padding for a larger button
      border: "2px solid", // Border with pastel rainbow colors
      borderImageSlice: 1,
      borderImageSource:
        "linear-gradient(90deg,  #DF8F52, #4189E4, #FEEB33)", // Light pastel rainbow gradient
      color: "black", // Button text color
      fontWeight: "bold",
      "&:hover": {
        borderImageSource:
          "linear-gradient(90deg, #DF8F52, #4189E4, #FEEB33)",
      },
    }}
  >
    Login
  </Button>

  <Button
    variant="outlined"
    onClick={handleGoogleAuth}
    fullWidth
    sx={{
      maxWidth: "600px", // Match the input field width
      borderRadius: "5px",
      padding: "15px 0", // Increased padding for a larger button
      border: "2px solid", // Border with pastel rainbow colors
      borderImageSlice: 1,
      borderImageSource:
        "linear-gradient(90deg, #fbc2eb, #a6c1ee, #b2f9fc, #fbd786)", // Light pastel rainbow gradient
      color: "black", // Button text color
      fontWeight: "bold",
      "&:hover": {
        borderImageSource:
          "linear-gradient(90deg, #fbd786, #b2f9fc, #a6c1ee, #fbc2eb)",
      },
    }}
  >
    Login with Google
  </Button>
</Box>

        {/* Forgot Password and Signup Links */}
        <Typography>
  Forgot Password?{" "}
  <span
    style={{
      color: "#FFC300", // Bright yellow color
      fontWeight: "bold",
      textDecoration: "underline",
      cursor: "pointer",
      transition: "color 0.3s ease",
    }}
    onClick={handleForgotPassword}
    onMouseEnter={(e) => (e.target.style.color = "#FF5733")} // Changes to orange on hover
    onMouseLeave={(e) => (e.target.style.color = "#FFC300")} // Back to yellow on mouse leave
  >
    Click here
  </span>
</Typography>

<Typography>
  Don't have an account?{" "}
  <Link
    to="/signup"
    style={{
      color: "#66FCF1", // Bright teal color for initial state
      fontWeight: "bold",
      textDecoration: "underline",
      transition: "color 0.3s ease, font-size 0.3s ease",
    }}
    onMouseEnter={(e) => {
      e.target.style.color = "#45A29E"; // Darken color on hover
      e.target.style.fontSize = "110%"; // Slightly enlarge font on hover
    }}
    onMouseLeave={(e) => {
      e.target.style.color = "#66FCF1"; // Back to original teal color
      e.target.style.fontSize = "100%"; // Back to original size
    }}
  >
    Signup Now!
  </Link>
</Typography>

      </Box>
    </Form>
  );
}

export default LoginForm;
