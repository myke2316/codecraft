import { Formik, Form, ErrorMessage, Field } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useJoinClassMutation } from "../Teacher/classService";
import { addStudent } from "../Teacher/classSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
function JoinClassForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userDetails);
  const [joinClass, { isLoading }] = useJoinClassMutation();

  async function handleJoinClass(values) {
    const { inviteCode } = values;
    try {
      const res = await joinClass({ inviteCode, studentId: user._id }).unwrap();
      const classData = res;
      console.log(classData);
      dispatch(addStudent(classData.class));
      toast.success("Successfully joined class!");
      navigate(`/${user._id}`);
    } catch (error) {
      toast.error(error?.data?.error || error.message);
    }
  }

  return (
    <Formik initialValues={{ inviteCode: "" }} onSubmit={handleJoinClass}>
      <Form className="text-white">
        <div>
          <label htmlFor="inviteCode">Invite Code:</label>
          <Field type="text" name="inviteCode" className="text-black" />
          <ErrorMessage
            name="className"
            component="div"
            className="text-red-400"
          />
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </Form>
    </Formik>
  );
}
export default JoinClassForm;
