import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoute = ({ element, ...rest }) => {
  const user = useSelector((state) => state.user.userDetails);

  // If user is logged in, redirect to the home page or another appropriate route
  if (user) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default PublicRoute;
