import { ErrorMessage, Field, Form } from "formik";
import Button from "../../Components/Button";
import {
  buttonStyle,
  formStyle,
  googleButtonStyle,
  inputFieldStyle,
} from "../../stylesConstants";

function LoginForm() {
  return (
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
          <Button type="submit" className={googleButtonStyle}>
            Login with Google
          </Button>
        </div>
      </div>
    </Form>
  );
}
export default LoginForm;
