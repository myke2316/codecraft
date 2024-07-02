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
          </Route>
        </Route>

        <Route element={<CourseLayout />}>
          <Route path="" element={<PrivateRoutes />}>
            <Route path="course/*" element={<CourseContent />}>
              
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
