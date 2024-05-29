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
import AuthorizedLayout from "./ui/AuthorizedLayout";
import CreateClassForm from "./features/Teacher/CreateClassForm";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="course" element={<Course />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="redirect" element={<GoogleRedirect />} />
          <Route
            path="reset-password/:resetToken"
            element={<ResetPassword />}
          />

          <Route path="" element={<PrivateRoutes />}>
            <Route path="role-selection" element={<RoleSelection />} />
            <Route path="create-class" element={<CreateClassForm />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
