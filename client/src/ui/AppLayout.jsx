import { Outlet, useLocation, useNavigate } from "react-router-dom";
import NavLayout from "./NavBar/NavLayout";
import Header from "./Header";
import FooterLayout from "./Footer/FooterLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useEffect } from "react";

function AppLayout() {
  const user = useSelector((state) => state.user.userDetails);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle cases where user is null or undefined
    if (!user) {
    
      
      return;
    }

    // Check if the user is on the role selection page
    const isRoleSelectionPage = location.pathname === "/role-selection";
    const hasRole = user.role;

    // Redirect to the role selection page if the user doesn't have a role and tries to navigate away
    if (!hasRole && !isRoleSelectionPage) {
      navigate("/role-selection", { replace: true });
    }
  }, [user, navigate, location.pathname]);

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-screen">
      <nav>
        <NavLayout />
      </nav>
      <div>
        <main>
          <Outlet />
          <ToastContainer />
        </main>
      </div>
      <FooterLayout />
    </div>
  );
}

export default AppLayout;
