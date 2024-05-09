import { Outlet } from "react-router";
import NavLayout from "./NavBar/NavLayout";
import Header from "./Header";
import FooterLayout from "./Footer/FooterLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function AppLayout() {
  return (
    <div className="grid grid-rows-[auto_auto_1fr_auto] h-screen">
      <header className="text-textprimarycolor1">
        <Header />
      </header>

      <nav className="bg-navcolor2">
        <NavLayout />
      </nav>
      <div className="overflow-auto bg-mainbgcolor">
        <main className="max-w-6xl m-auto">
          <Outlet />
          <ToastContainer />
        </main>
      </div>
      <FooterLayout />
    </div>
  );
}
export default AppLayout;
