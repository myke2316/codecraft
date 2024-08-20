import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./ui/Home";
import AppLayout from "./ui/AppLayout";
import Course from "./pages/Course";
import About from "./pages/About";

import Login from "./features/LoginRegister/Login";
import SignUp from "./features/LoginRegister/SignUp";
import ResetPassword from "./features/LoginRegister/ResetPassword";
import GoogleRedirect from "./ui/GoogleRedirectPage";
import RoleSelection from "./ui/RoleSelection";
import PrivateRoutes from "./Components/PrivateRoutes";
import AuthorizedLayout from "./features/Authorized/AuthorizedLayout";
import CreateClassForm from "./features/Teacher/CreateClassForm";
import Profile from "./pages/Profile";
import JoinClassForm from "./features/Student/JoinClassForm";
import NormalRedirect from "./features/LoginRegister/NormalRedirect";
import ClassLayout from "./features/Class/ClassLayout";
import ClassHome from "./features/Class/ClassHome";
import AuthorizedHome from "./features/Authorized/AuthorizedHome";
import CourseContent from "./features/Course/CourseContent";
import CourseLayout from "./features/Course/CourseLayout";

import DocumentContent from "./features/Course/Lesson/Documentation/DocumentContent";
import LessonContent from "./features/Course/Lesson/LessonContent";
import QuizContent from "./features/Course/Lesson/Quiz/QuizContent";
import ActivityContent from "./features/Course/Lesson/Activity/ActivityContent";
import ActivityLayout from "./features/Course/Lesson/Activity/ActivityLayout";
import DocumentComplete from "./features/Course/Lesson/Documentation/DocumentComplete";
import QuizResults from "./features/Course/Lesson/Quiz/QuizResults";
import ActivityPage from "./features/Course/CodingActivity/ActivityPage";
import ActivityList from "./features/Course/CodingActivity/ActivityList";
import QnA from "./features/QnA/QnA";

import QuestionForm from "./features/QnA/QuestionForm";
import QuestionDetail from "./features/QnA/QuestionDetail/QuestionDetail";
import EditQuestionPage from "./features/QnA/QuestionDetail/EditQuestionPage";
import EditAnswerPage from "./features/QnA/QuestionDetail/EditAnswerPage";
import StudentDashboard from "./features/Student/StudentDashboard/StudentDashboard";
import PrivateRoutesTeacher from "./Components/PrivateRoutesTeacher";

import ClassLists from "./features/Teacher/ClassLists";
import TeacherClassHome from "./features/Teacher/TeacherClassHome";
import StudentTeacherProfile from "./features/Teacher/StudentTeacherProfile";
import TeacherEditClass from "./features/Teacher/TeacherEditClass";
import AdminLayout from "./features/Admin/AdminLayout";
import AdminsHome from "./features/Admin/AdminsHome";
import PrivateRoutesAdmin from "./features/Admin/PrivateRoutesAdmin";
import AdminDashboard from "./features/Admin/pages/AdminDashboard";
import AdminUsers from "./features/Admin/pages/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="aboutCourse" element={<Course />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="redirect" element={<GoogleRedirect />} />
          <Route path="normal-redirect" element={<NormalRedirect />} />
          <Route path="" element={<PrivateRoutes />}>
            <Route
              path="reset-password/:resetToken"
              element={<ResetPassword />}
            />
          </Route>
        </Route>

        <Route element={<ClassLayout />}>
          <Route path="" element={<PrivateRoutes />}>
            <Route path="studentClass/:classId" element={<ClassHome />} />
          </Route>
        </Route>

        <Route element={<AuthorizedLayout />}>
          <Route path="" element={<PrivateRoutes />}>
            <Route path=":studentId" element={<AuthorizedHome />} />
            <Route path="join-class" element={<JoinClassForm />} />
            <Route path="role-selection" element={<RoleSelection />} />
            <Route path="create-class" element={<CreateClassForm />} />
            <Route path="profile" element={<Profile />} />
            <Route path="qna/:userId" element={<QnA />} />
            <Route path="qna/:userId/ask" element={<QuestionForm />} />
            <Route
              path="qna/:userId/question/:questionId"
              element={<QuestionDetail />}
            />
            <Route path="/edit-question/:id" element={<EditQuestionPage />} />
            <Route
              path="/edit-answer/:questionId/:answerId"
              element={<EditAnswerPage />}
            />
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>
        </Route>

        <Route element={<AuthorizedLayout />}>
          <Route path="" element={<PrivateRoutesTeacher />}>
            <Route
              path="/:classId/students/:studentId"
              element={<StudentTeacherProfile />}
            />
            <Route path="/:classId/class" element={<TeacherClassHome />} />
            <Route path="/classes" element={<ClassLists />} />
            <Route
              path="/:classId/class/class-edit"
              element={<TeacherEditClass />}
            />
          </Route>
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="" element={<PrivateRoutesAdmin />}>
            <Route path="/admin-home" element={<AdminsHome />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-users" element={<AdminUsers />} />
          </Route>
        </Route>
        <Route element={<CourseLayout />}>
          <Route path="" element={<PrivateRoutes />}>
            <Route path="course/*" element={<CourseContent />}>
              <Route
                path=":courseId/lesson/:lessonId"
                element={<LessonContent />}
              />
              <Route
                path=":courseId/lesson/:lessonId/document/:documentId"
                element={<DocumentContent />}
              />
              <Route
                path=":courseId/lesson/:lessonId/quiz/:quizId"
                element={<DocumentContent />}
              />
              <Route
                path=":courseId/lesson/:lessonId/quiz/results"
                element={<QuizResults />}
              />
              <Route
                path=":courseId/lesson/:lessonId/activity/activityList"
                element={<ActivityList />}
              />
              <Route
                path=":courseId/lesson/:lessonId/document/:documentId/complete"
                element={<DocumentComplete />}
              />
            </Route>
          </Route>
        </Route>
        <Route element={<ActivityLayout />}>
          <Route path="" element={<PrivateRoutes />}>
            <Route path="course/*">
              <Route path="activity/:activityId" element={<ActivityPage />} />

              <Route
                path=":courseId/lesson/:lessonId/activity/:activityId"
                element={<ActivityPage />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
