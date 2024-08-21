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
function SignUp() {
  // handle Register
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //handles registration process
  const [register, { isLoading }] = useRegisterMutation();
  const userDetails = useSelector((state) => state.user.userDetails);
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

  const [fetchCourseData, { isLoading: isLoadingCourse }] =
    useGetCourseDataMutation();
  async function fetchCourse() {
    try {
      const courseData = await fetchCourseData().unwrap();
      dispatch(setCourse(courseData || []));
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error?.response?.data?.message || error.message);
    }
  }

  useEffect(() => {
    if (userDetails) {
      if(userDetails.role === "student"){

        toast.success("Register Complete!");
        navigate(`/${userDetails._id}`);
      }else{
        toast.success("Register Complete!");
        navigate(`/classes`);
      }
    }
  }, [userDetails]);

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
