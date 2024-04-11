import { Formik } from "formik";
import * as Yup from "yup";
import LoginForm from "./LoginForm";
import { Link } from "react-router-dom";
function Login() {
  return (
    <div className="text-textprimarycolor1">
      <h1>Login</h1>
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
      >
        <div>
          <LoginForm />

          <div>
            <p className="mt-1">
              Forgot Password?{" "}
              <span
                className="text-yellow-100 cursor-pointer"
           
              >
                Click here
              </span>
            </p>
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-textColorGreen">
                Signup Now!
              </Link>
            </p>
          </div>
        </div>
      </Formik>
    </div>
  );
}
export default Login;
