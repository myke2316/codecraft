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
import { useCreateUserAnalyticsMutation } from "./userAnalyticsService";
import { setUserAnalytics } from "./userAnalyticsSlice";
import { createQuizSubmission } from "../../utils/quizSubmissionUtil";
import { useCreateUserQuizSubmissionMutation } from "../Course/Quiz/quizSubmissionService";
function JoinClassForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userDetails);
  const [joinClass, { isLoading }] = useJoinClassMutation();

  const [
    createUserQuizSubmissions,
    { isLoading: isLoadingCreateQuizSubmissions },
  ] = useCreateUserQuizSubmissionMutation();

  async function handleJoinClass(values) {
    const { inviteCode } = values;
    try {
      const res = await joinClass({ inviteCode, studentId: user._id }).unwrap();
      const classData = res;
      console.log(classData);
      dispatch(addStudent(classData.class));
      createProgress();
      createUserAnalytics();
      createQuizSubmission(dispatch, createUserQuizSubmissions, user._id);
      toast.success("Successfully joined class!");
      navigate(`/${user._id}`);
    } catch (error) {
      toast.error(error?.data?.error || error.message);
    }
  }

  const [createUserProgress, { isLoading: isLoadingProgress }] =
    useCreateUserProgressMutation();

  async function createProgress() {
    try {
      const userProgressData = await createUserProgress({
        userId: user._id,
      }).unwrap();
      dispatch(setUserProgress(userProgressData));
      console.log(userProgressData);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || error.data);
    }
  }

  const [createAnalytics, { isLoading: isLoadingAnalytics }] =
    useCreateUserAnalyticsMutation();

  async function createUserAnalytics() {
    try {
      const userAnalyticsData = await createAnalytics({
        userId: user._id,
      }).unwrap();
      dispatch(setUserAnalytics(userAnalyticsData));
      console.log(userAnalyticsData);
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
