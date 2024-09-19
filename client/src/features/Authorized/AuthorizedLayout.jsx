import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";
import AuthorizedNavBar from "./NavBar/AuthorizedNavBar";
import Header from "../../ui/Header";
import FooterLayout from "../../ui/Footer/FooterLayout";
import { useSelector } from "react-redux";

function AuthorizedLayout() {
  const user = useSelector(state => state.user.userDetails)
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="bg-headercolor text-textprimarycolor1">
        <Header />
      </header>
     {user.role && <nav>
        <AuthorizedNavBar />
      </nav>}
      <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 ">
        <Outlet />
        <ToastContainer />
      </main>
      {/* <footer className="bg-footercolor">
        <FooterLayout />
      </footer> */}
    </div>
  );
}

export default AuthorizedLayout;
