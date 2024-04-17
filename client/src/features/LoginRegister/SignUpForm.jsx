import { ErrorMessage, Field, Form } from "formik";
import Button from "../../Components/Button";
import { Link } from "react-router-dom";
import {
  buttonStyle,
  formStyle,
  googleButtonStyle,
} from "../../stylesConstants";

function SignUpForm() {
  return (
    <Form className="">
      <div className={formStyle}>
        <label htmlFor="emailaddress">Email Address:</label>
        <Field
          className=""
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
          className=""
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
          className=""
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
          className=""
          name="confirmpassword"
          type="password"
          placeholder="Confirm Password"
        />
        <ErrorMessage component="div" className="" name="confirmpassword" />
      </div>

      <div className={formStyle}>
        <label htmlFor="role">Role:</label>
        <Field
          className=""
          name="role"
          type="text"
          as="select"
          placeholder="Confirm Password"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </Field>
        <ErrorMessage component="div" className="" name="role" />
      </div>

      <div className="flex gap-3">
        <Button className={buttonStyle}>Register</Button>
        <Button className={googleButtonStyle}> Register with Google</Button>
      </div>

   
    </Form>
  );
}
export default SignUpForm;
