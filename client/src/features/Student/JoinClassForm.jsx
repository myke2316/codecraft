import { Formik, Form, ErrorMessage, Field } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useJoinClassMutation } from "../Teacher/classService";
import { addStudent } from "../Teacher/classSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import {
  useCreateUserProgressMutation,
  useFetchUserProgressMutation,
} from "./studentCourseProgressService";
import { setUserProgress } from "./studentCourseProgressSlice";
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
      createProgress();
      toast.success("Successfully joined class!");
      navigate(`/${user._id}`);
    } catch (error) {
      toast.error(error?.data?.error || error.message);
    }
  }

  const [createUserProgress, { isLoading: isLoadingCreate }] =
    useCreateUserProgressMutation();
  const [fetchUserProgress, { isLoading: isLoadingFetch }] =
    useFetchUserProgressMutation();

  async function createProgress() {
    try {
      const userProgressData = await createUserProgress({
        userId: user._id,
      }).unwrap();
      dispatch(setUserProgress(userProgressData ));
      console.log(userProgressData);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || error.data);
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
