import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

function PrivateRoutesAdmin() {
  const userInfo = useSelector((state) => state.user.userDetails);

  return userInfo && userInfo.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
}
export default PrivateRoutesAdmin;
