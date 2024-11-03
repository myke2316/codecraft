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
    try {
      const res = await resetPassword({ resetToken, password }).unwrap();
      toast.success("Reset Password Successful");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3f51b5] to-[#928fce]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Reset Password</h1>
        
        <Formik
          initialValues={{
            password: "",
            confirmPassword: "",
          }}
          validationSchema={Yup.object({
            password: Yup.string()
              .min(8, "Password too short.")
              .max(30, "Password too long")
              .required("Password is required."),
            confirmPassword: Yup.string()
              .oneOf([Yup.ref("password"), null], "Passwords must match.")
              .required("Confirmation is required."),
          })}
          onSubmit={handleResetPassword}
        >
          <Form>
            <div className="mb-5">
              <label htmlFor="password" className="block text-gray-600 mb-2">
                Password
              </label>
              <Field
                className="bg-gray-100 border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="password"
                type="password"
                placeholder="Enter new password"
              />
              <ErrorMessage
                component="div"
                className="text-red-500 text-sm mt-1"
                name="password"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block text-gray-600 mb-2">
                Confirm Password
              </label>
              <Field
                className="bg-gray-100 border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
              />
              <ErrorMessage
                component="div"
                className="text-red-500 text-sm mt-1"
                name="confirmPassword"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md shadow hover:bg-blue-700 transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default ResetPassword;
