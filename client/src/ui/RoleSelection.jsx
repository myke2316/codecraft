import { ErrorMessage, Field, Form, Formik } from "formik";
import { Button, Box, Typography, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateRoleMutation } from "../features/LoginRegister/userService";
import { Navigate, useNavigate } from "react-router";
import { logout } from "../features/LoginRegister/userSlice"; 

function RoleSelection() {
  const user = useSelector((state) => state.user.userDetails);
  const [updateRole] = useUpdateRoleMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    try {
      // Send role selection data to backend
      const res = await updateRole({
        userId: user._id,
        role: values.role,
      });

      if (res) {
        navigate("/redirect");
      }

      toast.success("Role selection successful");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return !user.role ? (
    <Box
      className="flex flex-col items-center justify-center min-h-screen"
      sx={{
        bgcolor: "background.default",
        p: 4,
        borderRadius: 2,
       
        maxWidth: "400px",
        mx: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Role Selection
      </Typography>

      <Formik
        initialValues={{
          role: "",
        }}
        onSubmit={(values) => handleSubmit(values)}
        validate={(values) => {
          const errors = {};
          if (!values.role) {
            errors.role = "Role is required";
          }
          return errors;
        }}
      >
        {({ isSubmitting, handleChange, values }) => (
          <Form>
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="role-select-label">Select Role</InputLabel>
              <Field
                as={Select}
                labelId="role-select-label"
                id="role"
                name="role"
                label="Select Role"
                value={values.role}
                onChange={handleChange}
                className="w-full"
              >
                <MenuItem value="">
                  <em>Choose a role...</em>
                </MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </Field>
              <ErrorMessage name="role" component="div" className="text-red-500 mt-1" />
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              className="w-full mb-3"
            >
              Submit
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  ) : (
    <Navigate to="/" replace />
  );
}

export default RoleSelection;
