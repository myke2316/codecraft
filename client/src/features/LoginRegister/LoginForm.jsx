import { ErrorMessage, Field, Form } from "formik";
import Button from "../../Components/Button";

function LoginForm() {
  const formStyle = "flex flex-col";
  const inputFieldStyle =
    "block mb-2 text-sm font-medium text-gray-900 dark:text-white";
  const buttonStyle =
    "mt-3 rounded-md bg-bgColorLightRed px-10 py-3 text-base font-medium text-white transition duration-200 active:bg-red-500  dark:text-white dark:hover:bg-red-700";
  const googleButtonStyle =
    "mt-3 rounded-md border-2 border-red-300 px-10 py-3 text-base font-medium text-brand-500 transition duration-200  hover:border-red-700  dark:text-white dark:hover:bg-red-300/10 ";
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
          className="text-navcolor1"
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
