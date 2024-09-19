// Login.js
import { Formik } from "formik";
import * as Yup from "yup";
import LoginForm from "./LoginForm";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "./userService";
import { useDispatch } from "react-redux";
import { setCredentials } from "./userSlice";
import { toast } from "react-toastify";
import { Button, Box, Typography } from "@mui/material";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  function test() {
    const storage = localStorage.getItem("userDetails");
    console.log(storage);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Login
      </Typography>
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

    </Box>
  );
}

export default Login;
