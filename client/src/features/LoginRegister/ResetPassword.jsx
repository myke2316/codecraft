import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import { useResetPasswordMutation } from "./userService";
import { useNavigate, useParams } from "react-router";

function ResetPassword() {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const params = useParams();
  const navigate = useNavigate();
  async function handleResetPassword(value) {
    const { password, confirmPassword } = value;
    const { resetToken } = params;
    console.log(resetToken);
    try {
      const res = await resetPassword({ resetToken, password }).unwrap();
      toast.success("Reset Password Successful");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }

  return (
    <div className="container mx-auto mt-8 mb-28 p-4 max-w-md text-white">
      <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
      <hr />

      <Formik
        initialValues={{
          password: "",
          confirmPassword: "",
        }}
        validationSchema={Yup.object({
          password: Yup.string()
            .min(8, "Password too short.")
            .max(20, "Password too long")
            .required("Required"),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Password does not match.")
            .required("Required"),
        })}
        onSubmit={handleResetPassword}
      >
        <div>
          <Form>
            <div className="mb-4">
              <label htmlFor="email">Password:</label>
              <Field
                className="bg-white border border-gray-300 p-2 rounded-md mt-2 w-full text-slate-800"
                name="password"
                type="text"
                placeholder="password"
              />
              <ErrorMessage
                component="div"
                className="bg-red-300"
                name="password"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <Field
                className="bg-white border border-gray-300 p-2 rounded-md mt-2 w-full text-slate-800"
                name="confirmPassword"
                type="text"
                placeholder="Confirm Password"
              />
              <ErrorMessage
                component="div"
                className="bg-red-300"
                name="confirmPassword"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-600"
            >
              Reset Password
            </button>

            {/* {isLoading && <Spinner />} */}
          </Form>
        </div>
      </Formik>
    </div>
  );
}
export default ResetPassword;
