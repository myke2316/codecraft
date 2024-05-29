import { Formik } from "formik";
import SignUpForm from "./SignUpForm";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "./userService";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setCredentials } from "./userSlice";
function SignUp() {
  // handle Register
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //handles registration process
  const [register, { isLoading }] = useRegisterMutation();
  async function handleRegister(values) {
    const { emailaddress, username, password, role } = values;
    console.log(values);
    try {
      const res = await register({
        email: emailaddress,
        username,
        password,
        role,
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
      toast.success("Register Complete!");
    } catch (error) {
      toast.error(error?.data?.error || error?.error);
    }
  }

  return (
    <div className="text-textprimarycolor1">
      <h1> {"<SignUp>"}</h1>
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
            .required("Required"),
          username: Yup.string()
            .min(5, "Username too short")
            .max(20, "Username too long")
            .required("Required"),
          password: Yup.string()
            .min(8, "Password too short.")
            .max(20, "Password too long")
            .required("Required"),
          confirmpassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Password does not match.")
            .required("Required"),
          role: Yup.string().required("Required"),
        })}
        onSubmit={handleRegister}
      >
        <div>
          <SignUpForm />

          <p className="mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500">
              Login here
            </Link>
          </p>
        </div>
      </Formik>
      <h1> {"</SignUp>"}</h1>
    </div>
  );
}
export default SignUp;
