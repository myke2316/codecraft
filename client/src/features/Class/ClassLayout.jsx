import { ToastContainer } from "react-toastify";
import Header from "../../ui/Header";
import ClassNavBar from "./NavBar/ClassNavBar";
import FooterLayout from "../../ui/Footer/FooterLayout";
import { Outlet } from "react-router";

function ClassLayout() {
  return (
    <div className="grid grid-rows-[auto_auto_1fr_auto] h-screen">
      <header className="text-textprimarycolor1">
        <Header />
      </header>

      <nav className="bg-navcolor2">
        <ClassNavBar />
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
export default ClassLayout;
