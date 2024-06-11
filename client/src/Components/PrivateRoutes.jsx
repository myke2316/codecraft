import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import AuthorizedLayout from "../features/Authorized/AuthorizedLayout";
function PrivateRoutes() {
  const userInfo = useSelector((state) => state.user.userDetails);

  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
}
export default PrivateRoutes;
