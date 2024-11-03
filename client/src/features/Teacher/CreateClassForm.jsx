import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useCreateClassMutation } from "./classService";
import { useDispatch, useSelector } from "react-redux";
import { addClass } from "./classSlice";
import { useNavigate } from "react-router";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Refresh as RefreshIcon, School as SchoolIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const validationSchema = Yup.object({
  className: Yup.string().required("Class Name is required").max(20, "Class name cannot exceed 20 characters"),
  inviteCode: Yup.string().required("Invite Code is required"),
});

const CreateClassForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState(generateInviteCode());
  const [createClass, { isLoading }] = useCreateClassMutation();
  const teacher = useSelector((state) => state.user.userDetails._id);

  async function handleCreateClass(values) {
    const { className, inviteCode } = values;
    try {
      const res = await createClass({
        className,
        inviteCode,
        teacher,
      }).unwrap();
      dispatch(addClass(res));
     
      navigate(`/classes`);
      toast.success("Successfully created class!");
    } catch (error) {
      toast.error(error?.data?.error || error?.error);
    }
  }

  return (
    <Box className="flex items-center justify-center min-h-screen bg-gray-100">
      <Paper elevation={3} className="p-8 w-full max-w-md mx-auto">
    
        <Box className="flex items-center justify-center mb-6">
        <IconButton onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon className="text-primary mr-2" fontSize="large" />
          <Typography variant="h4" component="h1" className="text-primary font-bold">
            Create New Class
          </Typography>
        </Box>
        <Formik
          initialValues={{
            className: "",
            inviteCode: inviteCode,
          }}
          validationSchema={validationSchema}
          onSubmit={handleCreateClass}
        >
          {({ isSubmitting, setFieldValue, errors, touched }) => (
            <Form className="space-y-6">
              <Field
                as={TextField}
                fullWidth
                label="Class Name"
                name="className"
                variant="outlined"
                error={touched.className && errors.className}
                helperText={touched.className && errors.className}
                InputProps={{
                  className: "bg-white",
                }}
              />

              <Field
                as={TextField}
                fullWidth
                label="Class Invite Code"
                name="inviteCode"
                variant="outlined"
                value={inviteCode}
                error={touched.inviteCode && errors.inviteCode}
                helperText={touched.inviteCode && errors.inviteCode}
                InputProps={{
                  readOnly: true,
                  className: "bg-white",
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Generate new code">
                        <IconButton
                          onClick={() => {
                            const code = generateInviteCode();
                            setInviteCode(code);
                            setFieldValue("inviteCode", code);
                          }}
                          edge="end"
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isSubmitting || isLoading}
                className="mt-6"
              >
                {isSubmitting || isLoading ? (
                  <CircularProgress size={24} className="text-white" />
                ) : (
                  "Create Class"
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default CreateClassForm;