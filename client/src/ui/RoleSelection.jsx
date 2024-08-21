import { ErrorMessage, Field, Form, Formik } from "formik";
import Button from "../Components/Button";
import { toast } from "react-toastify";
import axios from "axios";
import { BACKEND_URL } from "../constants";
import { useSelector } from "react-redux";
import { useUpdateRoleMutation } from "../features/LoginRegister/userService";
import { Navigate, useNavigate } from "react-router";

function RoleSelection() {
  const user = useSelector((state) => state.user.userDetails);
  const [updateRole, { isSubmitting }] = useUpdateRoleMutation();
  const navigate = useNavigate();
  const handleSubmit = async (values) => {
    try {
      // Send role selection data to backend
      const res = await updateRole({
        userId: user._id,
        role: "teacher",
      });

      if (res) {
        navigate("/redirect");
      }
      // Handle successful response
      toast.success("Role selection successful");
      // Redirect to homepage or any other page as needed
    } catch (error) {
      // Handle error
      toast.error(error?.response?.data?.message || error?.message);
    }
  };
  return !user.role ? (
    <div>
      <h2>Role Selection</h2>
      <Formik
        initialValues={{
          role: "", // Initial value for role selection
        }}
        onSubmit={handleSubmit}
        validate={(values) => {
          const errors = {};
          // Validation logic can be added here if needed
          if (!values.role) {
            errors.role = "Role is required";
          }
          return errors;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="role">Select Role:</label>
              <Field as="select" name="role" className="form-control">
                <option value="">Choose a role...</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </Field>
              <ErrorMessage
                name="role"
                component="div"
                className="text-danger"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  ) : (
    <Navigate to="/" replace />
  );
}
export default RoleSelection;
