import { Outlet } from "react-router";
import { Link } from "react-router-dom";

function AuthorizedLayout() {
  return (
    <div>
      <Link to="/role-selection" />
      <Outlet />
    </div>
  );
}
export default AuthorizedLayout;
