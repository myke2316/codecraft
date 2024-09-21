import { ErrorMessage, Field, Form, useFormikContext } from "formik";
import { Box, Button, TextField, IconButton, InputAdornment, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { BACKEND_URL } from "../../constants";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";

function SignUpForm() {
  const { values } = useFormikContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // handle Google Sign up or login
  function handleGoogleAuth() {
    try {
      window.location.href = `${BACKEND_URL}/auth/google/callback`;
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }

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
        <Field name="emailaddress">
          {({ field, meta }) => (
            <TextField
              {...field}
              label="Email Address"
              fullWidth
              sx={{
                width: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width
              }}
              error={meta.touched && !!meta.error}
              helperText={meta.touched && meta.error ? meta.error : ""}
            />
          )}
        </Field>

        {/* Username Field */}
        <Field name="username">
          {({ field, meta }) => (
            <TextField
              {...field}
              label="Full Name"
              fullWidth
              sx={{
                width: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width
              }}
              error={meta.touched && !!meta.error}
              helperText={meta.touched && meta.error ? meta.error : ""}
            />
          )}
        </Field>

        {/* Password Field */}
        <Field name="password">
          {({ field, meta }) => (
            <TextField
              {...field}
              type={showPassword ? "text" : "password"}
              label="Password"
              fullWidth
              sx={{
                width: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width
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

        {/* Confirm Password Field */}
        <Field name="confirmpassword">
          {({ field, meta }) => (
            <TextField
              {...field}
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              fullWidth
              sx={{
                width: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width
              }}
              error={meta.touched && !!meta.error}
              helperText={meta.touched && meta.error ? meta.error : ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Field>

        {/* Role Field */}
        <Field name="role" as="select">
          {({ field, meta }) => (
            <TextField
              {...field}
              select
              label="Role"
              SelectProps={{ native: true }}
              fullWidth
              sx={{
                width: { xs: "90%", sm: "80%", md: "600px" }, // Responsive width
              }}
              error={meta.touched && !!meta.error}
              helperText={meta.touched && meta.error ? meta.error : ""}
            >
              <option value=""></option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </TextField>
          )}
        </Field>

        {/* Submit and Google Sign-Up Buttons */}
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button
            type="submit"
            variant="outlined"
            sx={{
              borderRadius: "5px",
              padding: "10px 20px",
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
            Register
          </Button>

          <Button
            variant="outlined"
            onClick={handleGoogleAuth}
            sx={{
              borderRadius: "5px",
              padding: "10px 20px",
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
            Register with Google
          </Button>
        </Box>
      </Box>
    </Form>
  );
}

export default SignUpForm;
