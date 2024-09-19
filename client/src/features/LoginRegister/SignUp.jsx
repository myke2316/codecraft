import { Formik } from "formik";
import SignUpForm from "./SignUpForm";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "./userService";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setCredentials } from "./userSlice";
import { useEffect } from "react";
import { useGetCourseDataMutation } from "../Class/courseService";
import { setCourse } from "../Class/courseSlice";
import { Box, Typography, Button } from "@mui/material";

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  }, [userDetails]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Sign Up
      </Typography>

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
            .min(5, "Username too short")
            .max(20, "Username too long")
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

      <Typography variant="body1" sx={{ mt: 2 }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "blue" }}>
          Login here
        </Link>
      </Typography>
    </Box>
  );
}

export default SignUp;
