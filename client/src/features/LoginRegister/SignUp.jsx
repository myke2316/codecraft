import { Formik } from "formik";
import SignUpForm from "./SignUpForm";
import * as Yup from "yup";
import { Link } from "react-router-dom";
function SignUp() {
  return (
    <div className="text-textprimarycolor1">
      <h1> {"<SignUp>"}</h1>
      <Formik
        initialValues={{
          emailaddress: "",
          username: "",
          password: "",
          role: "student",
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
