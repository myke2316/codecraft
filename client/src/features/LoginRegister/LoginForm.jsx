import { ErrorMessage, Field, Form, useFormikContext } from "formik";
import Button from "../../Components/Button";
import { toast } from "react-toastify";
import {
  buttonStyle,
  formStyle,
  googleButtonStyle,
  inputFieldStyle,
} from "../../stylesConstants";
import { useForgotPasswordMutation, useLoginMutation } from "./userService";
import { BACKEND_URL } from "../../constants";
import { Link } from "react-router-dom";

function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();

  //handling Google Login or Google OAuth
  function handleGoogleAuth() {
    
    try {
      window.location.href = `https://codecrafts.online/auth/google/callback`;
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }
console.log(BACKEND_URL + " HELKLO")
  //For ForgotPassword
  const { values } = useFormikContext();
  const emailValue = values.email;
  const [forgotPassword, { isLoading: isLoadingForgotPassword }] =
    useForgotPasswordMutation();
  async function handleForgotPassword() {
    if (!emailValue) return toast.error("Please Enter Email");
    console.log(emailValue);
    try {
      const res = await forgotPassword({ email: emailValue }).unwrap();
      toast.success(res.message);
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }

  return (
    <>
      <Form>
        <div className={formStyle}>
          <label htmlFor="email">Email Address:</label>
          <Field
            className={inputFieldStyle}
            name="email"
            type="email"
            placeholder="..."
          />
          <ErrorMessage
            component="div"
            className="text-textColorRed"
            name="email"
          />
        </div>
        <div className={formStyle}>
          <label htmlFor="password">Password:</label>
          <Field
            className={inputFieldStyle}
            name="password"
            type="password"
            placeholder="..."
          />
          <ErrorMessage
            component="div"
            className="text-textColorRed"
            name="password"
          />

          <div className="flex gap-9">
            <Button type="submit" className={buttonStyle}>
              Login
            </Button>
            <Button
              type="button"
              className={googleButtonStyle}
              disabled={isLoading}
              onClick={handleGoogleAuth}
            >
              Login with Google
            </Button>
          </div>
        </div>
      </Form>

      <div>
        <p className="mt-1">
          Forgot Password?{" "}
          <span
            className="text-yellow-100 cursor-pointer"
            onClick={handleForgotPassword}
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
    </>
  );
}
export default LoginForm;
