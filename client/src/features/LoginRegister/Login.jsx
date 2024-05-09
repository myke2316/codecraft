import { Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import LoginForm from "./LoginForm";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "./userService";
import { useDispatch } from "react-redux";
import { setCredentials } from "./userSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };
  //For Handling Login Button
  const [login, { isLoading }] = useLoginMutation();

  // async function handleLogin(value) {
  //   try {
  //     const res = await axios.post(
  //       `${BACKEND_URL}/api/users/login`,
  //       {
  //         email: value.email,
  //         password: value.password,
  //       },
  //       { withCredentials: true }
  //     );
  //     dispatch(setCredentials({ ...res }));
  //     console.log("Logged in successfully:", res.data);
  //     navigate("/");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async function handleLogin(value) {
    const { email, password } = value;
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
      toast.success("Login Successful");
    } catch (error) {
      toast.error(error?.data?.error || error?.error);
    }
  }

  function test() {
    const storage = localStorage.getItem("userDetails");
    console.log(storage);
  }

  return (
    <div className="text-textprimarycolor1">
      <h1>{"<Login />"}</h1>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid Email")
            .required("Email is Required"),
          password: Yup.string().required("Password is Required"),
        })}
        onSubmit={handleLogin}
      >
        <div>
          <LoginForm />
        </div>
      </Formik>
      <button onClick={test}>CLICK</button>
      <h1> {"</Login>"}</h1>
    </div>
  );
}
export default Login;
