import { Outlet } from "react-router";
import { Link } from "react-router-dom";
import AuthorizedNavBar from "./NavBar/AuthorizedNavBar";
import { ToastContainer } from "react-toastify";
import Header from "../../ui/Header";
import FooterLayout from "../../ui/Footer/FooterLayout";

function AuthorizedLayout() {
  return (
    <div className="grid grid-rows-[auto_auto_1fr_auto] h-screen">
      <header className="text-textprimarycolor1">
        <Header />
      </header>

      <nav className="bg-navcolor2">
        <AuthorizedNavBar />
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
export default AuthorizedLayout;
