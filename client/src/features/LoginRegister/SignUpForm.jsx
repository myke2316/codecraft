import { ErrorMessage, Field, Form, useFormikContext } from "formik";
import Button from "../../Components/Button";
import { toast } from "react-toastify";
import {
  buttonStyle,
  formStyle,
  googleButtonStyle,
} from "../../stylesConstants";
import { BACKEND_URL } from "../../constants";

function SignUpForm() {
  const { values } = useFormikContext();
  // handle Google Sign up or login
  function handleGoogleAuth() {
    try {
      window.location.href = `${BACKEND_URL}/auth/google/callback`;
    } catch (error) {
      toast.error(error?.data?.message || error?.error);
    }
  }

  return (
    <Form className="">
      <div className={formStyle}>
        <label htmlFor="emailaddress">Email Address:</label>
        <Field
          className="text-slate-700"
          name="emailaddress"
          type="text"
          placeholder="Email Address"
        />
        <ErrorMessage
          component="div"
          className="text-textColorRed"
          name="emailaddress"
        />
      </div>

      <div className={formStyle}>
        <label htmlFor="">Username:</label>
        <Field
          className="text-slate-700"
          name="username"
          type="text"
          placeholder="Username"
        />
        <ErrorMessage
          component="div"
          className="text-textColorRed"
          name="username"
        />
      </div>
      <div className={formStyle}>
        <label htmlFor="password">Password:</label>
        <Field
          className="text-slate-700"
          name="password"
          type="password"
          placeholder="Password"
        />
        <ErrorMessage
          component="div"
          className="text-textColorRed"
          name="password"
        />
      </div>

      <div className={formStyle}>
        <label htmlFor="">Confirm Password:</label>
        <Field
          className="text-slate-700"
          name="confirmpassword"
          type="password"
          placeholder="Confirm Password"
        />
        <ErrorMessage
          component="div"
          className="text-textColorRed"
          name="confirmpassword"
        />
      </div>

      <div className={formStyle}>
        <label htmlFor="role">Role:</label>
        <Field
          className="text-slate-800"
          name="role"
          type="text"
          as="select"
          placeholder="Confirm Password"
        >
          <option value="">Choose a Role..</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </Field>
        <ErrorMessage
          component="div"
          className="text-textColorRed"
          name="role"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className={buttonStyle}>
          Register
        </Button>
        <Button
          className={googleButtonStyle}
          type="button"
          onClick={handleGoogleAuth}
        >
          {" "}
          Register with Google
        </Button>
      </div>
    </Form>
  );
}
export default SignUpForm;
