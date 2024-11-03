import React, { useEffect } from "react";
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
import SchoolIcon from "@mui/icons-material/School";

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [register] = useRegisterMutation();
  const userDetails = useSelector((state) => state.user.userDetails);

  const [fetchCourseData] = useGetCourseDataMutation();

  async function handleRegister(values) {
    const { emailaddress, givenname, middleinitial, lastname, password, role } =
      values;
    const username = middleinitial
      ? `${givenname} ${middleinitial.toUpperCase()} ${lastname}`
      : `${givenname} ${lastname}`;
    try {
      const res = await register({
        email: emailaddress,
        username,
        givenname,
        middleinitial,
        lastname,
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
          width: "100%",
          maxWidth: "500px",
          borderRadius: "12px",
          backgroundColor: "white",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: "#3f51b5", mb: 2 }} />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: "#1a237e",
              fontWeight: 700,
              textAlign: "center",
              mb: 1,
            }}
          >
            Join Our Learning Community
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#757575",
              textAlign: "center",
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
            // username: Yup.string()
            //   .matches(
            //     /^(?=.{3,100}$)([A-Za-z]+(?:[-'\s][A-Za-z]+)*)(?:\s+[A-Za-z]\.)?(?:\s+[A-Za-z]+)*(?:\s+(?:Jr\.|Sr\.|II|III|IV|V))?$/,
            //     "Please enter a valid full name or name (e.g., 'John A. Doe Jr.', 'Mary-Jane Smith', John D. Doe)"
            //   )
            //   .min(3, "Full name or name must be at least 3 characters long")
            //   .max(50, "Full name or name must be at most 50 characters long")
            //   .required("Full Name or name is Required"),
            givenname: Yup.string()
              .matches(
                /^[A-Za-z]+(?:[-'\s][A-Za-z]+)*$/,
                "Please enter a valid given name (e.g., 'John', 'Mary-Jane', 'Maria Alexandria')"
              )
              .min(2, "Given name must be at least 2 characters long")
              .max(20, "Given name must be at most 20 characters long")
              .required("Given name is required"),
            middleinitial: Yup.string()
              .matches(
                /^[A-Za-z]?$/,
                "Please enter a valid middle initial (e.g., 'A', 'B') or leave blank"
              )
              .max(1, "Middle initial must be a single letter")
              .notRequired(),
            lastname: Yup.string()
              .matches(
                /^[A-Za-z]+(?:[-'\s][A-Za-z]+)*$/,
                "Please enter a valid last name (e.g., 'Castillo', 'De La Cruz')"
              )
              .min(2, "Last name must be at least 2 characters long")
              .max(18, "Last name must be at most 18 characters long")
              .required("Last name is required"),
            password: Yup.string()
              .min(8, "Password too short")
              .max(20, "Password too long")
              .required("Password is Required")
              .matches(/^\S*$/, "Password cannot contain spaces"),
            confirmpassword: Yup.string()
              .oneOf([Yup.ref("password"), null], "Passwords do not match")
              .required("Confirm Password is Required")
              .matches(/^\S*$/, "Password cannot contain spaces"),
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
