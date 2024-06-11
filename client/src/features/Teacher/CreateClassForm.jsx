import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useCreateClassMutation } from "./classService";
import { useDispatch, useSelector } from "react-redux";
import { addClass, setClass } from "./classSlice";
import { useNavigate } from "react-router";

// Function to generate a random invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Validation schema for Formik
const validationSchema = Yup.object({
  className: Yup.string().required("Class Name is required"),
  inviteCode: Yup.string().required("Invite Code is required"),
});

const CreateClassForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [createClass, { isLoading }] = useCreateClassMutation();
  const teacher = useSelector((state) => state.user.userDetails._id);
  async function handleCreateClass(value) {
    const { className, inviteCode } = value;
    try {
      const res = await createClass({
        className,
        inviteCode,
        teacher,
      }).unwrap();
      dispatch(addClass(res));
      console.log(res)
      toast.success("Successfully created class!");
      navigate(`/${teacher}`)
    } catch (error) {
      toast.error(error?.data?.error || error?.error);
    }
  }

  return (
    <Formik
      initialValues={{
        className: "",
        inviteCode: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleCreateClass}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className="text-white">
          <div>
            <label htmlFor="className">Class Name (Unique):</label>
            <Field type="text" name="className" className="text-black" />
            <ErrorMessage
              name="className"
              component="div"
              className="text-red-400"
            />
          </div>

          <div>
            <label htmlFor="inviteCode">Generate Class Invite Code:</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Field
                type="text"
                name="inviteCode"
                value={inviteCode}
                readOnly
                className="text-black"
              />
              <button
                type="button"
                onClick={() => {
                  const code = generateInviteCode();
                  setInviteCode(code);
                  setFieldValue("inviteCode", code);
                  console.log(code);
                }}
              >
                Generate
              </button>
            </div>
            <ErrorMessage
              name="inviteCode"
              component="div"
              className="text-red-400"
            />
          </div>

          <div>
            <button type="submit" disabled={isSubmitting}>
              Create Class
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CreateClassForm;
