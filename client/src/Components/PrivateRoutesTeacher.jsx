import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import AuthorizedLayout from "../features/Authorized/AuthorizedLayout";
function PrivateRoutesTeacher() {
  const userInfo = useSelector((state) => state.user.userDetails);

  return userInfo && userInfo.role === 'teacher' ? <Outlet /> : <Navigate to="/login" replace />;
}
export default PrivateRoutesTeacher;
